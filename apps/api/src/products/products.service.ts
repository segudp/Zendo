import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(commerceId: string, createProductDto: CreateProductDto) {
    // Verificar si la categoría pertenece al mismo commerceId para mayor seguridad
    const category = await this.prisma.category.findFirst({
      where: {
        id: createProductDto.categoryId,
        commerceId,
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found or does not belong to this commerce');
    }

    return this.prisma.product.create({
      data: {
        ...createProductDto,
        commerceId,
      },
    });
  }

  async findAll(commerceId?: string) {
    // Si se pasa un commerceId, filtra. Si no, devuelve todos (útil para clientes buscando en un comercio específico).
    const whereClause = commerceId ? { commerceId } : {};
    return this.prisma.product.findMany({
      where: whereClause,
      include: {
        category: true,
      },
    });
  }

  async findOne(id: string, commerceId?: string) {
    const whereClause: Prisma.ProductWhereInput = { id };
    if (commerceId) {
      whereClause.commerceId = commerceId;
    }

    const product = await this.prisma.product.findFirst({
      where: whereClause,
      include: {
        category: true,
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async update(id: string, commerceId: string, updateProductDto: UpdateProductDto) {
    // Verifica que el producto exista y pertenezca a este comercio
    await this.findOne(id, commerceId);

    // Si se actualiza la categoría, verificamos pertenencia
    if (updateProductDto.categoryId) {
      const category = await this.prisma.category.findFirst({
        where: {
          id: updateProductDto.categoryId,
          commerceId,
        },
      });
      if (!category) {
        throw new NotFoundException('Category not found or does not belong to this commerce');
      }
    }

    return this.prisma.product.update({
      where: { id },
      data: updateProductDto,
    });
  }

  async remove(id: string, commerceId: string) {
    await this.findOne(id, commerceId);
    return this.prisma.product.delete({
      where: { id },
    });
  }

  // Método público auxiliar para uso de otros módulos (ej. Orders)
  async getProductsByIds(productIds: string[], commerceId: string) {
    const products = await this.prisma.product.findMany({
      where: {
        id: {
          in: productIds,
        },
        commerceId, // Garantiza que los productos pedidos pertenecen a ese comercio
      },
    });

    if (products.length !== productIds.length) {
      throw new NotFoundException('One or more products not found or do not belong to the given commerce');
    }

    return products;
  }
}
