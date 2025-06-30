import { Module } from '@nestjs/common';
import { PaymentsService } from './services/payments.service';
import { PaymentsController } from './controllers/payments.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { OrdersModule } from 'src/orders/orders.module';
import { MercadoPagoProvider } from './payment-providers/mercado-pago.provider';
import { PrismaService } from 'src/prisma/prisma.service';
import { OrdersService } from 'src/orders/services/orders.service';

@Module({
  imports: [PrismaModule, OrdersModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, MercadoPagoProvider,PrismaService, OrdersService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
