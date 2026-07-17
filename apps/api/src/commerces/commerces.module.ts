import { Module } from '@nestjs/common';
import { CommercesService } from './commerces.service';
import { CommercesController } from './commerces.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CommercesController],
  providers: [CommercesService],
  exports: [CommercesService],
})
export class CommercesModule {}
