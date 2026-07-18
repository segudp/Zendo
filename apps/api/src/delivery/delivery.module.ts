import { Module } from '@nestjs/common';
import { DeliveryService } from './delivery.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [DeliveryService],
  exports: [DeliveryService],
})
export class DeliveryModule {}
