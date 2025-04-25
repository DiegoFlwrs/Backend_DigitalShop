import { Module } from '@nestjs/common';
import { GeminiService } from './services/gemini.service';
import { GeminiController } from './controllers/gemini.controller';
import { BusquedaService } from './services/busquedad.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [GeminiService, BusquedaService,PrismaService],
  controllers: [GeminiController],
})
export class GeminiModule {}
