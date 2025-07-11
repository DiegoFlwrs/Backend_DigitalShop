import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { OrderResponseDto } from '../dtos/order-response.dto';
import { CreateOrderDto } from '../dtos/create-order.dto';
import { es } from 'date-fns/locale';
import { format } from 'date-fns';
@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

private mapOrderToResponse(order: any): OrderResponseDto {
  return {
    id: order.id,
    total: order.total,
    status: order.status,
    createdAt: order.createdAt,
    items: order.orderItems.map((item) => ({
      productId: item.variant.product.id,
      name: item.variant.product.name,
      price: item.price,
      quantity: item.quantity,
      imageUrl: item.variant.product.imageUrl,
    })),
    user: {
      name: order.user.name,
      email: order.user.email,
    },
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
            variant: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new NotFoundException('Cart is empty or not found');
    }

    for (const item of cart.items) {
      if (item.variant.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${item.variant.product.name}`);
      }
    }

    const total = cart.items.reduce((sum, item) => {
      const price = item.variant.price ?? item.variant.product.basePrice;
      return sum + price * item.quantity;
    }, 0);

    const order = await this.prisma.$transaction(async (prisma) => {
      const newOrder = await prisma.order.create({
        data: {
          userId,
          total,
          status: 'pending',
          shippingAddress: createOrderDto.shippingAddress,
          notes: createOrderDto.notes,
        },
        include: {
          user: true,
        },
      });

      const orderItems = await Promise.all(
        cart.items.map((item) =>
          prisma.orderItem.create({
            data: {
              orderId: newOrder.id,
              productVariantId: item.variant.id,
              quantity: item.quantity,
              price: item.variant.price ?? item.variant.product.basePrice,
            },
            include: {
              variant: {
                include: {
                  product: true,
                },
              },
            },
          }),
        ),
      );

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
            variant: {
              include: {
                product: true,
              },
            },
          },
        },
        user: true,
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
            variant: {
              include: {
                product: true,
              },
            },
          },
        },
        user: true,
      },
    });

    return orders.map((order) => this.mapOrderToResponse(order));
  }

  async updateOrderStatus(orderId: number, status: string) {
    return this.prisma.order.update({
      where: { id: orderId },
      data: { status },
    });
  }

  async getOrderSummaryByUser(userId: number) {
    const userExists = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!userExists) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const orders = await this.prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return orders.map((order) => ({
      id: order.id,
      title: `Pedido #${order.id.toString().padStart(3, '0')}`,
      status: this.translateStatus(order.status),
      date: format(order.createdAt, 'dd MMM yyyy', { locale: es }),
    }));
  }

  private translateStatus(status: string): string {
    switch (status) {
      case 'completed':
        return 'Entregado';
      case 'shipped':
        return 'En camino';
      case 'processing':
        return 'Preparando';
      case 'cancelled':
        return 'Cancelado';
      default:
        return 'Pendiente';
    }
  }

}
