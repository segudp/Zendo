import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { CommercesService } from './commerces.service';
import { CreateCommerceDto } from './dto/create-commerce.dto';
import { UpdateCommerceDto } from './dto/update-commerce.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('commerces')
export class CommercesController {
  constructor(private readonly commercesService: CommercesService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('COMMERCE_OWNER')
  @Post()
  create(@CurrentUser() user: any, @Body() createCommerceDto: CreateCommerceDto) {
    return this.commercesService.create(user.id, createCommerceDto);
  }

  @Get()
  findAll() {
    return this.commercesService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('COMMERCE_OWNER')
  @Get('my-commerce')
  findMyCommerce(@CurrentUser() user: any) {
    return this.commercesService.findByOwner(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.commercesService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('COMMERCE_OWNER')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() updateCommerceDto: UpdateCommerceDto,
  ) {
    return this.commercesService.update(id, user.id, updateCommerceDto);
  }
}
