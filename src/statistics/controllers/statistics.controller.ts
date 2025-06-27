import { Controller, Get } from '@nestjs/common';
import { StatisticsService } from '../services/statistics.service';

@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('favorites-by-category')
  getFavoritesByCategory() {
    return this.statisticsService.getFavoritesByCategory();
  }

  @Get('favorites-by-color')
  getFavoritesByColor() {
    return this.statisticsService.getFavoritesByColor();
  }

  @Get('products-by-category')
  getProductsByCategory() {
    return this.statisticsService.getProductsByCategory();
  }
}
