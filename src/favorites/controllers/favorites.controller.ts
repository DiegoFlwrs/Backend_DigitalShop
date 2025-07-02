import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { FavoritesService } from '../services/favorites.service';
import { FavoriteDto } from '../dto/favorite.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('favorites')
export class FavoritesController {
  constructor(private favoritesService: FavoritesService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('add')
  async addFavorite(@Body() body: FavoriteDto) {
    return this.favoritesService.addFavorite(body.userId, body.productId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('remove')
  async removeFavorite(@Body() body: FavoriteDto) {
    return this.favoritesService.removeFavorite(body.userId, body.productId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('list')
  async getFavorites(@Body() body: { userId: number }) {
    return this.favoritesService.getUserFavorites(body.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('check')
  async checkFavorite(@Body() body: FavoriteDto) {
    return this.favoritesService.isFavorite(body.userId, body.productId);
  }
}
