import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { OrderResponseDto } from '../dtos/order-response.dto';
import { CreateOrderDto } from '../dtos/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  private mapOrderToResponse(order: any): OrderResponseDto {
    return {
      id: order.id,
      total: order.total,
      status: order.status,
      createdAt: order.createdAt,
      items: order.orderItems.map(item => ({
        productId: item.productId,
        name: item.product.name,
        price: item.price,
        quantity: item.quantity,
        imageUrl: item.product.imageUrl,
      })),
      user:{
        name: order.user.name,
        email: order.user.email,
      }
    };
  }

  async createOrder(
    userId: number,
    createOrderDto: CreateOrderDto,
  ): Promise<OrderResponseDto> {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: { 
        items: {
          include: {
            product: true
          }
        } 
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new NotFoundException('Cart is empty or not found');
    }

    for (const item of cart.items) {
      if (item.product.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${item.product.name}`);
      }
    }

    const total = cart.items.reduce(
      (sum, item) => sum + (item.product.price * item.quantity),
      0,
    );

    const order = await this.prisma.$transaction(async (prisma) => {
      const newOrder = await prisma.order.create({
        data: {
          userId,
          total,
          status: 'pending',
          shippingAddress: createOrderDto.shippingAddress,
          notes: createOrderDto.notes,
        },
        include:{
          user:true
        }
      });

      // 2. Create order items
      const orderItems = await Promise.all(
        cart.items.map(item =>
          prisma.orderItem.create({
            data: {
              orderId: newOrder.id,
              productId: item.productId,
              quantity: item.quantity,
              price: item.product.price,
            },
            include: {
              product: true,
            },
          })
        )
      );

      await prisma.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return { ...newOrder, orderItems };
    });

    return this.mapOrderToResponse(order);
  }

  async getOrder(userId: number, orderId: number): Promise<OrderResponseDto> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId, userId },
      include: { 
        orderItems: {
          include: {
            product: true
          }
        },
        user:true 
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return this.mapOrderToResponse(order);
  }

  async getUserOrders(userId: number): Promise<OrderResponseDto[]> {
    const orders = await this.prisma.order.findMany({
      where: { userId },
      include: { 
        orderItems: {
          include: {
            product: true
          }
        } 
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return orders.map(order => this.mapOrderToResponse(order));
  }

  async updateOrderStatus(orderId: number, status: string) {
    return this.prisma.order.update({
      where: { id: orderId },
      data: { status },
    });
  }
}