import { Controller, Get, UseGuards } from '@nestjs/common';
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
  @Get('favorites-by-color')
  getFavoritesByColor() {
    return this.statisticsService.getFavoritesByColor();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('products-by-category')
  getProductsByCategory() {
    return this.statisticsService.getProductsByCategory();
  }
}
