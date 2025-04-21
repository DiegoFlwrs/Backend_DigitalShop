import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { GeminiService } from './gemini.service';

@Injectable()
export class BusquedaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly geminiService: GeminiService,
  ) {}

  async buscarPrendas(consultaUsuario: string) {
    try {
      // 1. Enviar consulta a Gemini con instrucción clara
      const respuestaGemini = await this.geminiService.queryToSQL(
        `Extrae los filtros de esta frase y dame solo la condición SQL para buscar en una base de datos. 
Usa exactamente los campos: color, size, brand, category. 
Ejemplo de salida válida: color = 'negro' AND size = 'M' AND category = 'polo'.
corrige las faltas ortográficas que haya y dale sentido si no lo tiene y extrae los filtros por los cuales se pueda filtrar en una BD.
ten cuidado en category, ahi puede aver valores como polos, camisas, zapatillas, etc, que distinguien el tipo de prenda
Frase: "${consultaUsuario}"`
      );

      //console.log('Respuesta de Gemini:', respuestaGemini);

      // Convierte las condiciones
      const filtros = await this.convertirCondiciones(respuestaGemini);

      // Realiza la búsqueda en la base de datos
      const prendas = await this.prisma.product.findMany({
        where: filtros,
        include: {
          category: true, // Incluir la categoría si quieres obtener también los detalles de la categoría
        },
      });

      return prendas;
    } catch (error) {
      console.error('Error en búsqueda:', error);
      return [];
    }
  }

  // Convierte string tipo "color = 'negro' AND talla = 'M' AND category = 'camisa'" a objeto Prisma
  private async convertirCondiciones(condicionesTexto: string): Promise<any> {
    const condiciones: any = {};
  
    const camposMapeados: Record<string, string> = {
      talla: 'size',
      marca: 'brand',
      color: 'color',
      category: 'categoryId', // Mapeamos 'category' a 'categoryId' para la relación
    };
  
    const regex = /(\w+)\s*=\s*'([^']+)'/g;
    let match;
  
    while ((match = regex.exec(condicionesTexto)) !== null) {
      const campoOriginal = match[1].trim().toLowerCase();
      const valor = match[2].trim();
  
      const campo = camposMapeados[campoOriginal] || campoOriginal;

      if (campo === 'categoryId') {
        // Si el campo es categoryId, buscar el id de la categoría
        const categoria = await this.prisma.category.findUnique({
          where: {
            name: valor, // Buscar la categoría por su nombre
          },
        });
        if (categoria) {
          condiciones[campo] = categoria.id;
        }
      } else {
        // Para los otros campos, agregamos el filtro normalmente
        condiciones[campo] = {
          equals: valor,
          mode: 'insensitive', // Ignorar mayúsculas/minúsculas
        };
      }
    }
  
    return condiciones;
  }
}
