import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { GeminiService } from "../services/gemini.service";
import { BusquedaService } from '../services/busquedad.service';
import { AuthGuard } from "@nestjs/passport";

@Controller('gemini')
export class GeminiController {
  constructor(private readonly geminiService: GeminiService,
    private readonly busquedaService: BusquedaService) {}
  
    @UseGuards(AuthGuard('jwt'))
  @Post()
  async handleQuery(@Body('query') query: string) {
    const result = await this.geminiService.queryToSQL(query);
    return {
      success: true,
      result: result,
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('busqueda')
  async buscar(@Body() body: { consulta: string }) {
    return this.busquedaService.buscarPrendas(body.consulta);
  }

}
