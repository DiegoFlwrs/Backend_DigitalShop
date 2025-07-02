import { Controller, Get, Param, Query } from '@nestjs/common';
import { VariantsService } from '../services/variants.service';

@Controller('variants')
export class VariantsController {
  constructor(private readonly variantsService: VariantsService) {}

  @Get('/:productId')
  getVariants(@Param('productId') productId: string) {
    return this.variantsService.getVariantsByProduct(+productId);
  }

  @Get('/:productId/colors')
  getColors(@Param('productId') productId: string) {
    return this.variantsService.getAvailableColors(+productId);
  }

  @Get('/:productId/sizes')
  getSizes(@Param('productId') productId: string) {
    return this.variantsService.getAvailableSizes(+productId);
  }

  @Get('/:productId/sizes-for-color')
  getSizesForColor(
    @Param('productId') productId: string,
    @Query('color') color: string,
  ) {
    return this.variantsService.getSizesForColor(+productId, color);
  }

  @Get('/:productId/colors-for-size')
  getColorsForSize(
    @Param('productId') productId: string,
    @Query('size') size: string,
  ) {
    return this.variantsService.getColorsForSize(+productId, size);
  }

  @Get('/:productId/variant-details')
  getVariantDetails(
    @Param('productId') productId: string,
    @Query('color') color: string,
    @Query('size') size: string,
  ) {
    return this.variantsService.getVariantDetails(+productId, color, size);
  }

  @Get('/:productId/first-variant-for-color')
  getFirstVariantForColor(
    @Param('productId') productId: string,
    @Query('color') color: string,
  ) {
    return this.variantsService.getFirstVariantForColor(+productId, color);
  }
}
