// cart.controller.ts
import { Controller, Post, Body, Delete, Get, Param, UseGuards } from '@nestjs/common';
import { CartService } from '../services/cart.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}
  @UseGuards(AuthGuard('jwt'))
  @Post('add')
  async addToCart(@Body() body: { userId: number; productId: number; quantity?: number }) {
    return this.cartService.addToCart(body.userId, body.productId, body.quantity || 1);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('remove/:userId/:productId')
  async removeFromCart(
    @Param('userId') userId: number,
    @Param('productId') productId: number,
  ) {
    return this.cartService.removeFromCart(userId, productId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('items/:userId')
  async getCartItems(@Param('userId') userId: number) {
    return this.cartService.getCartItems(userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('update')
  async updateQuantity(
    @Body() body: { userId: number; productId: number; quantity: number },
  ) {
    return this.cartService.updateQuantity(body.userId, body.productId, body.quantity);
  }
}