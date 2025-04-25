import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { GeminiService } from "../services/gemini.service";
import { BusquedaService } from '../services/busquedad.service';

@Controller('gemini')
export class GeminiController {
  constructor(private readonly geminiService: GeminiService,
    private readonly busquedaService: BusquedaService) {}

  @Post()
  async handleQuery(@Body('query') query: string) {
    const result = await this.geminiService.queryToSQL(query);
    return {
      success: true,
      result: result,
    };
  }

  @Get('busqueda')
  async buscar(@Body() body: { consulta: string }) {
    return this.busquedaService.buscarPrendas(body.consulta);
  }

}
