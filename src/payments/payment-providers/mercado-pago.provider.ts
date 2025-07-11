import { Injectable } from '@nestjs/common';
import { PaymentProvider } from '../interfaces/payment-provider.interface';
import { PaymentResponseDto } from '../dto/payment-response.dto';
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MercadoPagoProvider implements PaymentProvider {
  private preference: Preference;
  private payment: Payment;

  constructor(
    private readonly mailerService: MailerService,
  ) {
    const mp = new MercadoPagoConfig({
      accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
    });

    this.preference = new Preference(mp);
    this.payment = new Payment(mp);
  }

  async createPayment(
    amount: number,
    orderId: number,
    user: any,
    successUrl: string,
    failureUrl: string,
  ): Promise<PaymentResponseDto> {
    const preference = {
      items: [
        {
          id: orderId.toString(),
          title: `Order #${orderId}`,
          unit_price: amount,
          quantity: 1,
        },
      ],
      payer: {
        name: user.name,
        email: user.email,
      },
      external_reference: orderId.toString(),
      back_urls: {
        success: successUrl,
        failure: failureUrl,
        pending: `${successUrl}?status=pending`,
      },
      auto_return: 'approved',
    };

    const response = await this.preference.create({ body: preference });

    return {
      id: response.id!,
      status: 'pending',
      paymentUrl: response.init_point,
      transactionId: response.id,
    };
  }

  async handleWebhook(data: any): Promise<{ success: boolean; orderId: number; status: string }> {
  try {
    if (data.action === 'payment.created' || data.type === 'payment') {
      const paymentId = Number(data.data?.id || data.id);
      const payment = await this.payment.get({ id: paymentId });

      const orderId = parseInt(payment.external_reference ?? '0');
      const status = payment.status;
      const email = payment.payer?.email

      console.log(`📦 Webhook recibido - Pago ${paymentId} para orden ${orderId} con estado ${status}`);

      if (status === 'approved' && email) {
          await this.mailerService.sendMail({
            to: email,
            subject: 'Pago confirmado',
            text: `Tu pago para la orden #${orderId} ha sido aprobado. ¡Gracias por tu compra!`,
          });
        }

      return {
        success: status === 'approved',
        orderId,
        status: status ?? '',
      };
    }

    return { success: false, orderId: 0, status: '' };
  } catch (error) {
    console.error('❌ Error en handleWebhook MercadoPago:', error);
    return { success: false, orderId: 0, status: '' };
  }
}
}
