import { Module } from '@nestjs/common';
import { NodeNplService } from './services/node-npl.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ProductController } from './controllers/product.controller';

@Module({
  imports: [PrismaModule], 
  providers: [NodeNplService],
  controllers: [ProductController],
})
export class NodeNplModule {}