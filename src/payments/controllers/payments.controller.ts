import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  Get,
  Param,
  Headers,
  HttpCode,
} from '@nestjs/common';
import { Request } from 'express';
import { PaymentsService } from '../services/payments.service';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { PaymentMethod } from '../dto/create-payment.dto';
import { PaymentResponseDto } from '../dto/payment-response.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async create(
    @Req() req: Request,
    @Body() createPaymentDto: CreatePaymentDto,
  ): Promise<PaymentResponseDto> {
    return this.paymentsService.createPayment(
      (req.user as any)?.userId,
      createPaymentDto,
    );
  }

  @Post('webhook/:method')
  @HttpCode(200)
  async handleWebhook(
    @Param('method') method: PaymentMethod,
    @Req() req: Request,
  ): Promise<{ success: boolean }> {
    const body = req.body;
    return this.paymentsService.handleWebhook(method, body);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id/status')
  async getStatus(@Req() req: Request, @Param('id') id: string) {
    const userId = (req.user as any)?.userId;
    return this.paymentsService.getPaymentStatus(userId, parseInt(id));
  }
  
}
