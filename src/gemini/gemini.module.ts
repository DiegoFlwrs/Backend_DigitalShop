import { Module } from '@nestjs/common';
import { GeminiService } from './services/gemini.service';
import { GeminiController } from './controllers/gemini.controller';
import { BusquedaService } from './services/busquedad.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

@Module({
  providers: [GeminiService, BusquedaService,PrismaService,ConfigService],
  controllers: [GeminiController],
})
export class GeminiModule {}
