import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { LogisticsService } from './logistics.service';
import { DeliveryService } from '../delivery/delivery.service';
import { SetDriverStatusDto } from './dto/set-driver-status.dto';
import { UpdateDriverLocationDto } from './dto/update-driver-location.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserPayload } from '../common/interfaces/user-payload.interface';

@Controller('logistics')
export class LogisticsController {
  constructor(
    private readonly logisticsService: LogisticsService,
    private readonly deliveryService: DeliveryService,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DRIVER')
  @Patch('driver/status')
  setStatus(@CurrentUser() user: UserPayload, @Body() dto: SetDriverStatusDto) {
    return this.deliveryService.setOnlineStatus(user.id, dto.isOnline);
  }

  // Fallback REST usado por la tarea en segundo plano del repartidor cuando el socket está cerrado
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DRIVER')
  @Post('driver/location')
  updateLocation(@CurrentUser() user: UserPayload, @Body() dto: UpdateDriverLocationDto) {
    return this.deliveryService.updateDriverLocation(user.id, dto.lat, dto.lng);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DRIVER')
  @Get('driver/active-order')
  activeOrder(@CurrentUser() user: UserPayload) {
    return this.logisticsService.findActiveOrderForDriver(user.id);
  }
}
