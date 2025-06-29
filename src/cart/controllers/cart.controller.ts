// cart.controller.ts
import { Controller, Post, Body, Delete, Get, Param } from '@nestjs/common';
import { CartService } from '../services/cart.service';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post('add')
  async addToCart(@Body() body: { userId: number; productId: number; quantity?: number }) {
    return this.cartService.addToCart(body.userId, body.productId, body.quantity || 1);
  }

  @Delete('remove/:userId/:productId')
  async removeFromCart(
    @Param('userId') userId: number,
    @Param('productId') productId: number,
  ) {
    return this.cartService.removeFromCart(userId, productId);
  }

  @Get('items/:userId')
  async getCartItems(@Param('userId') userId: number) {
    return this.cartService.getCartItems(userId);
  }

  @Post('update')
  async updateQuantity(
    @Body() body: { userId: number; productId: number; quantity: number },
  ) {
    return this.cartService.updateQuantity(body.userId, body.productId, body.quantity);
  }
}