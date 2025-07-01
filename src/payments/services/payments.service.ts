import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { MercadoPagoProvider } from '../payment-providers/mercado-pago.provider';
import { OrdersService } from 'src/orders/services/orders.service';
import { PaymentMethod } from '../dto/create-payment.dto';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { PaymentResponseDto } from '../dto/payment-response.dto';

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private mercadoPagoProvider: MercadoPagoProvider,
    private ordersService: OrdersService,
  ) {}

  private getProvider(method: PaymentMethod) {
    switch (method) {
      case PaymentMethod.MERCADO_PAGO:
        return this.mercadoPagoProvider;
      default:
        throw new BadRequestException('Unsupported payment method');
    }
  }

  async createPayment(
    userId: number,
    createPaymentDto: CreatePaymentDto,
  ): Promise<PaymentResponseDto> {
    const order = await this.ordersService.getOrder(
      userId,
      createPaymentDto.orderId,
    );

    if (order.status !== 'pending') {
      throw new BadRequestException('Order has already been processed');
    }

    const provider = this.getProvider(createPaymentDto.method);

    const paymentResponse = await provider.createPayment(
      order.total,
      order.id,
      { id: userId, email: order.user.email, name: order.user.name },
      createPaymentDto.successUrl,
      createPaymentDto.failureUrl,
    );

    await this.prisma.payment.create({
      data: {
        paymentMethod: createPaymentDto.method,
        amount: order.total,
        currency: 'PEN',
        transactionId: paymentResponse.id,
        status: 'pending',
        userId,
        orderId: order.id,
      },
    });

    return paymentResponse;
  }

  async handleWebhook(
  method: PaymentMethod,
  data: any,
): Promise<{ success: boolean }> {
  const provider = this.getProvider(method);
  const { success, orderId, status } = await provider.handleWebhook(data);

  // Validación de seguridad
  if (!orderId || !status) {
    return { success: false };
  }

  if (status === 'approved') {
    // 👉 Procesar pago exitoso
    await this.prisma.$transaction(async (prisma) => {
      await prisma.payment.updateMany({
        where: { orderId },
        data: { status: 'completed' },
      });

      await prisma.order.update({
        where: { id: orderId },
        data: { status: 'completed' },
      });

      const orderItems = await prisma.orderItem.findMany({
        where: { orderId },
      });

      for (const item of orderItems) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }
    });
  } else if (status === 'rejected') {
    // 👉 Si fue rechazado, actualiza el estado pero no borres nada
    await this.prisma.payment.updateMany({
      where: { orderId },
      data: { status: 'failed' },
    });

    await this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'failed' }, // puedes usar 'failed' o 'pending'
    });

    console.log(`⚠️ Pago rechazado para orden ${orderId}`);
  }

  return { success: true };
}

  async getPaymentStatus(userId: number, paymentId: number) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId, userId },
      include: { order: true },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return {
      id: payment.transactionId,
      status: payment.status,
      amount: payment.amount,
      method: payment.paymentMethod,
      orderId: payment.orderId,
      createdAt: payment.createdAt,
    };
  }
}
