import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  Get,
  Param,
  Query,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';
import { OrdersService } from '../services/orders.service';
import { CreateOrderDto } from '../dtos/create-order.dto';
import { OrderResponseDto } from '../dtos/order-response.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async create(
    @Req() req: Request,
    @Body() createOrderDto: CreateOrderDto,
  ): Promise<OrderResponseDto> {
    const userId = (req.user as any)?.userId;
    return this.ordersService.createOrder(userId, createOrderDto);
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  async findOne(
    @Req() req: Request,
    @Param('id') id: string,
  ): Promise<OrderResponseDto> {
    const userId = (req.user as any)?.userId;
    return this.ordersService.getOrder(userId, parseInt(id));
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async findAll(
    @Req() req: Request,
    @Query('limit') limit?: number,
    @Query('page') page?: number,
  ): Promise<OrderResponseDto[]> {
    const userId = (req.user as any)?.userId
    return this.ordersService.getUserOrders(userId);
  }
  
}