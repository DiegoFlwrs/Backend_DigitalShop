import { Module } from '@nestjs/common';
import { VariantsService } from './services/variants.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { VariantsController } from './controllers/variants.controller';

@Module({
  providers: [VariantsService,PrismaService],
  controllers: [VariantsController]
})
export class VariantsModule {}
