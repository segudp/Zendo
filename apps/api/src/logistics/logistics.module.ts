import { Module } from '@nestjs/common';
import { LogisticsService } from './logistics.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [LogisticsService],
  exports: [LogisticsService],
})
export class LogisticsModule {}
