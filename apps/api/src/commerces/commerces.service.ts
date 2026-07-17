import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommerceDto } from './dto/create-commerce.dto';
import { UpdateCommerceDto } from './dto/update-commerce.dto';

@Injectable()
export class CommercesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(ownerId: string, createCommerceDto: CreateCommerceDto) {
    // Check if the user already has a commerce
    const existingCommerce = await this.prisma.commerce.findUnique({
      where: { ownerId },
    });
    if (existingCommerce) {
      throw new ForbiddenException('User already owns a commerce');
    }

    return this.prisma.commerce.create({
      data: {
        ...createCommerceDto,
        ownerId,
      },
    });
  }

  async findAll() {
    return this.prisma.commerce.findMany({
      where: { isActive: true },
    });
  }

  async findOne(id: string) {
    const commerce = await this.prisma.commerce.findUnique({
      where: { id },
    });
    if (!commerce) {
      throw new NotFoundException(`Commerce with ID ${id} not found`);
    }
    return commerce;
  }

  async findByOwner(ownerId: string) {
    const commerce = await this.prisma.commerce.findUnique({
      where: { ownerId },
    });
    if (!commerce) {
      throw new NotFoundException('Commerce for this user not found');
    }
    return commerce;
  }

  async update(id: string, ownerId: string, updateCommerceDto: UpdateCommerceDto) {
    const commerce = await this.findOne(id);
    if (commerce.ownerId !== ownerId) {
      throw new ForbiddenException('You can only update your own commerce');
    }

    return this.prisma.commerce.update({
      where: { id },
      data: updateCommerceDto,
    });
  }
}
