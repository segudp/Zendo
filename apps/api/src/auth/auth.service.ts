import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async loginWithEmail(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (!user.isActive) {
      throw new UnauthorizedException('User is not active');
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { passwordHash, ...safeUser } = user;

    return {
      ...(await this.issueTokens(user.id)),
      user: safeUser,
    };
  }

  async refresh(refreshToken: string) {
    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (
      !storedToken ||
      storedToken.revoked ||
      storedToken.expiresAt < new Date() ||
      !storedToken.user.isActive
    ) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Rotación: se invalida el token usado y se emite un par nuevo
    await this.prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revoked: true },
    });

    const { passwordHash, ...safeUser } = storedToken.user;

    return {
      ...(await this.issueTokens(storedToken.userId)),
      user: safeUser,
    };
  }

  private async issueTokens(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const accessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = crypto.randomBytes(40).toString('hex');
    const refreshExpiresInDays = 30;
    await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + refreshExpiresInDays * 24 * 60 * 60 * 1000),
      },
    });

    return { accessToken, refreshToken };
  }
}
