import { Module } from '@nestjs/common';
import { LogisticsService } from './logistics.service';
import { LogisticsController } from './logistics.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { DeliveryModule } from '../delivery/delivery.module';

@Module({
  imports: [PrismaModule, DeliveryModule],
  controllers: [LogisticsController],
  providers: [LogisticsService],
  exports: [LogisticsService],
})
export class LogisticsModule {}
