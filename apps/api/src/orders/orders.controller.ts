import { Controller, Get, Post, Body, Patch, Param, UseGuards, ForbiddenException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CLIENT')
  @Post()
  create(@CurrentUser() user: any, @Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(user.id, createOrderDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@CurrentUser() user: any) {
    if (user.role === 'CLIENT') {
      return this.ordersService.findAllForClient(user.id);
    } else if (user.role === 'COMMERCE_OWNER') {
      const commerceId = user.commerce?.id;
      if (!commerceId) throw new ForbiddenException('User does not have an associated commerce');
      return this.ordersService.findAllForCommerce(commerceId);
    }
    // Para otros roles, según los requisitos, podría rechazarse
    throw new ForbiddenException('Access denied for this role');
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    const commerceId = user.commerce?.id;
    return this.ordersService.updateStatus(id, updateOrderStatusDto, user.role, commerceId);
  }
}
