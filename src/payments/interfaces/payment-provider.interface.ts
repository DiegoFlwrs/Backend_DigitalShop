import { CreatePaymentDto } from '../dto/create-payment.dto';
import { PaymentResponseDto } from '../dto/payment-response.dto';

export interface PaymentProvider {
  createPayment(
    amount: number,
    orderId: number,
    user: any,
    successUrl: string,
    failureUrl: string,
  ): Promise<PaymentResponseDto>;

  handleWebhook(data: any): Promise<{ success: boolean; orderId: number }>;
}