import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UsersModule } from '../users/users.module';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [
    UsersModule,
    PrismaModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET');
        if (!secret) {
          throw new Error('JWT_SECRET is not defined (check your .env)');
        }
        return {
          secret,
          signOptions: {
            expiresIn: configService.get<string>('JWT_EXPIRATION', '1d') as any,
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    // Nota: RolesGuard NO se registra como APP_GUARD global a propósito.
    // Los guards globales corren antes que los @UseGuards() de cada ruta, así que
    // si RolesGuard fuera global se ejecutaría antes que JwtAuthGuard y siempre
    // vería request.user vacío (todo devolvería 403). Cada ruta protegida ya
    // declara explícitamente [JwtAuthGuard, RolesGuard] en el orden correcto.
  ],
  exports: [JwtModule],
})
export class AuthModule {}
