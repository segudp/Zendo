import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { AuthModule } from '../auth/auth.module';
import { LogisticsModule } from '../logistics/logistics.module';
import { DeliveryModule } from '../delivery/delivery.module';

@Module({
  imports: [AuthModule, LogisticsModule, DeliveryModule],
  providers: [EventsGateway],
})
export class EventsModule {}
