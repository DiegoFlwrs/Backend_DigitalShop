import { IsEnum, IsNumber, IsString, IsNotEmpty } from 'class-validator';

export enum PaymentMethod {
  MERCADO_PAGO = 'mercado_pago',
  YAPE = 'yape',
}

export class CreatePaymentDto {
  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @IsNumber()
  orderId: number;

  @IsString()
  @IsNotEmpty()
  successUrl: string;

  @IsString()
  @IsNotEmpty()
  failureUrl: string;
}
