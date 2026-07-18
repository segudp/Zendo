import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ForbiddenException, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserPayload } from '../common/interfaces/user-payload.interface';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('COMMERCE_OWNER')
  @Post()
  create(@CurrentUser() user: UserPayload, @Body() createProductDto: CreateProductDto) {
    const commerceId = user.commerce?.id;
    if (!commerceId) throw new ForbiddenException('User does not have an associated commerce');
    return this.productsService.create(commerceId, createProductDto);
  }

  // Permite listar productos por commerceId, de libre acceso (ej. clientes)
  @Get()
  findAll(@Query('commerceId') commerceId: string) {
    return this.productsService.findAll(commerceId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('COMMERCE_OWNER')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentUser() user: UserPayload,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    const commerceId = user.commerce?.id;
    if (!commerceId) throw new ForbiddenException('User does not have an associated commerce');
    return this.productsService.update(id, commerceId, updateProductDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('COMMERCE_OWNER')
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: UserPayload) {
    const commerceId = user.commerce?.id;
    if (!commerceId) throw new ForbiddenException('User does not have an associated commerce');
    return this.productsService.remove(id, commerceId);
  }
}
