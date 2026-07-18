import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CommercesModule } from './commerces/commerces.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { LogisticsModule } from './logistics/logistics.module';
import { DeliveryModule } from './delivery/delivery.module';
import { EventsModule } from './events/events.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../.env', // Asumiendo estructura de monorepo, el .env principal en la raíz
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    CommercesModule,
    ProductsModule,
    OrdersModule,
    EventEmitterModule.forRoot(),
    LogisticsModule,
    DeliveryModule,
    EventsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
