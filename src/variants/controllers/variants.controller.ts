import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { VariantsService } from '../services/variants.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('variants')
export class VariantsController {
  constructor(private readonly variantsService: VariantsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('/:productId')
  getVariants(@Param('productId') productId: string) {
    return this.variantsService.getVariantsByProduct(+productId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/:productId/colors')
  getColors(@Param('productId') productId: string) {
    return this.variantsService.getAvailableColors(+productId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/:productId/sizes')
  getSizes(@Param('productId') productId: string) {
    return this.variantsService.getAvailableSizes(+productId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/:productId/sizes-for-color')
  getSizesForColor(
    @Param('productId') productId: string,
    @Query('color') color: string,
  ) {
    return this.variantsService.getSizesForColor(+productId, color);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/:productId/colors-for-size')
  getColorsForSize(
    @Param('productId') productId: string,
    @Query('size') size: string,
  ) {
    return this.variantsService.getColorsForSize(+productId, size);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/:productId/variant-details')
  getVariantDetails(
    @Param('productId') productId: string,
    @Query('color') color: string,
    @Query('size') size: string,
  ) {
    return this.variantsService.getVariantDetails(+productId, color, size);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/:productId/first-variant-for-color')
  getFirstVariantForColor(
    @Param('productId') productId: string,
    @Query('color') color: string,
  ) {
    return this.variantsService.getFirstVariantForColor(+productId, color);
  }
}
