import { Module } from '@nestjs/common';
import { CommercesService } from './commerces.service';
import { CommercesController } from './commerces.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ProductsModule } from '../products/products.module';
import { LogisticsModule } from '../logistics/logistics.module';

@Module({
  imports: [PrismaModule, ProductsModule, LogisticsModule],
  controllers: [CommercesController],
  providers: [CommercesService],
  exports: [CommercesService],
})
export class CommercesModule {}
