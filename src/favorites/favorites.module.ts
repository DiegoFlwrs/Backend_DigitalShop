import { Module } from '@nestjs/common';
import { FavoritesService } from './services/favorites.service';
import { FavoritesController } from './controllers/favorites.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [FavoritesService,PrismaService],
  controllers: [FavoritesController],
})
export class FavoritesModule {}
