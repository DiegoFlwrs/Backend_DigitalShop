import { Controller, Post, Body } from '@nestjs/common';
import { NodeNplService } from '../services/node-npl.service';

@Controller('product')
export class ProductController {
  constructor(private readonly nlpService: NodeNplService) {}

  @Post('search')
  async searchProduct(@Body('query') query: string) {
    const result = await this.nlpService.processQuery(query);
    return result;
  }
}