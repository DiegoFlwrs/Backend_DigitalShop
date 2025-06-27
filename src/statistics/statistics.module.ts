import { Module } from '@nestjs/common';
import { StatisticsService } from './services/statistics.service';
import { StatisticsController } from './controllers/statistics.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [StatisticsService, PrismaService],
  controllers: [StatisticsController]
})
export class StatisticsModule {}
