import { Controller, Get, Post, Body, Patch, Param, UseGuards, Query, ForbiddenException } from '@nestjs/common';
import { CommercesService } from './commerces.service';
import { CreateCommerceDto } from './dto/create-commerce.dto';
import { UpdateCommerceDto } from './dto/update-commerce.dto';
import { ProductsService } from '../products/products.service';
import { LogisticsService } from '../logistics/logistics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserPayload } from '../common/interfaces/user-payload.interface';

@Controller('catalog/commerces')
export class CommercesController {
  constructor(
    private readonly commercesService: CommercesService,
    private readonly productsService: ProductsService,
    private readonly logisticsService: LogisticsService,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('COMMERCE_OWNER')
  @Post()
  create(@CurrentUser() user: UserPayload, @Body() createCommerceDto: CreateCommerceDto) {
    return this.commercesService.create(user.id, createCommerceDto);
  }

  // Público: si se pasan lat/lng busca comercios cercanos vía PostGIS, si no, lista general
  @Get()
  findAll(
    @Query('lat') lat?: string,
    @Query('lng') lng?: string,
    @Query('radius') radius?: string,
  ) {
    if (lat && lng) {
      const radiusKm = radius ? Number(radius) / 1000 : 5;
      return this.logisticsService.findNearbyCommerces(Number(lat), Number(lng), radiusKm);
    }
    return this.commercesService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('COMMERCE_OWNER')
  @Get('my-commerce')
  findMyCommerce(@CurrentUser() user: UserPayload) {
    return this.commercesService.findByOwner(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.commercesService.findOne(id);
  }

  // Menú público de un comercio (usado por las apps de cliente)
  @Get(':id/products')
  findProducts(@Param('id') id: string) {
    return this.productsService.findAll(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('COMMERCE_OWNER')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentUser() user: UserPayload,
    @Body() updateCommerceDto: UpdateCommerceDto,
  ) {
    return this.commercesService.update(id, user.id, updateCommerceDto);
  }
}
