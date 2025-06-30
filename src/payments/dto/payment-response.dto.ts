export class PaymentResponseDto {
  id: string;
  status: string;
  paymentUrl?: string;
  qrCode?: string;
  transactionId?: string;
}
