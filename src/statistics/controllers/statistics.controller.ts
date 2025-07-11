import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { StatisticsService } from '../services/statistics.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('favorites-by-category')
  getFavoritesByCategory() {
    return this.statisticsService.getFavoritesByCategory();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('favorites-by-category/:userId')
  getFavoritesByCategoryUser(@Param('userId') userId: number) {
    return this.statisticsService.getFavoritesByCategoryUser(userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('favorites-by-color')
  getFavoritesByColor() {
    return this.statisticsService.getFavoritesByColor();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('products-by-category')
  getProductsByCategory() {
    return this.statisticsService.getProductsByCategory();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('average-spend/:userId')
  async getUserSpendPrediction(@Param('userId') userId: string) {
    const id = parseInt(userId, 10);
    return this.statisticsService.getUserSpendData(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('average-spend-favorite/:userId')
  async getUserSpendPredictionFavorites(@Param('userId') userId: string) {
    const id = parseInt(userId, 10);
    return this.statisticsService.getUserPredictionData(id);
  }
}
