import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { GeminiModule } from './gemini/gemini.module';
import { FavoritesModule } from './favorites/favorites.module';
import { StatisticsModule } from './statistics/statistics.module';
import { CartModule } from './cart/cart.module';
import { PaymentsModule } from './payments/payments.module';
import { OrdersModule } from './orders/orders.module';
import { VariantsModule } from './variants/variants.module';
import { PorfileModule } from './porfile/porfile.module';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        service: 'gmail',
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS,
        },
      },
      defaults: {
        from: `"Soporte" <${process.env.MAIL_USER}>`,
      },
    }),
    PrismaModule, UsersModule, AuthModule, GeminiModule, FavoritesModule, StatisticsModule, CartModule, PaymentsModule, OrdersModule, VariantsModule, PorfileModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
