import { Controller, Post, Body } from '@nestjs/common';
import { FavoritesService } from '../services/favorites.service';
import { FavoriteDto } from '../dto/favorite.dto';

@Controller('favorites')
export class FavoritesController {
  constructor(private favoritesService: FavoritesService) {}

  @Post('add')
  async addFavorite(@Body() body: FavoriteDto) {
    return this.favoritesService.addFavorite(body.userId, body.productId);
  }

  @Post('remove')
  async removeFavorite(@Body() body: FavoriteDto) {
    return this.favoritesService.removeFavorite(body.userId, body.productId);
  }

  @Post('list')
  async getFavorites(@Body() body: { userId: number }) {
    return this.favoritesService.getUserFavorites(body.userId);
  }

  @Post('check')
  async checkFavorite(@Body() body: FavoriteDto) {
    return this.favoritesService.isFavorite(body.userId, body.productId);
  }
}
