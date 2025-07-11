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
      const respuestaGemini = await this.geminiService.queryToSQL(
        `Extrae los filtros de esta frase solo si tiene relación con ropa o moda, y dame únicamente la condición SQL para buscar en una base de datos. 
   Usa exactamente los campos permitidos: color, size, brand, category. 
   Si la frase no tiene sentido o no está relacionada con ropa, responde solo con una cadena vacía ("").

   Corrige cualquier falta ortográfica en la frase si es necesario para interpretarla correctamente.

   Ejemplo de salida válida: color = 'negro' AND size = 'M' AND category = 'polo'.
   Ejemplo de salida inválida: "quiero comprar un coche" → ""

   Frase: "${consultaUsuario}"`,
      );

      const filtros = await this.convertirCondiciones(respuestaGemini);

      return this.prisma.product.findMany({
        where: {
          AND: [
            // Filtros para el producto
            {
              OR: [
                filtros.brand
                  ? { brand: { contains: filtros.brand, mode: 'insensitive' } }
                  : {},
                filtros.categoryId ? { categoryId: filtros.categoryId } : {},
              ],
            },
            // Filtros para las variantes
            {
              variants: {
                some: {
                  AND: [
                    filtros.color
                      ? {
                          color: { equals: filtros.color, mode: 'insensitive' },
                        }
                      : {},
                    filtros.size ? { size: { equals: filtros.size } } : {},
                  ],
                },
              },
            },
          ],
        },
        include: {
          variants: true,
          category: true,
        },
      });
    } catch (error) {
      console.error('Error en búsqueda:', error);
      return [];
    }
  }

  private async convertirCondiciones(condicionesTexto: string): Promise<any> {
    const condiciones: any = {};

    const camposMapeados: Record<string, string> = {
      talla: 'size',
      marca: 'brand',
      color: 'color',
      category: 'categoryId',
    };

    const regex = /(\w+)\s*=\s*'([^']+)'/g;
    let match;

    while ((match = regex.exec(condicionesTexto)) !== null) {
      const campoOriginal = match[1].trim().toLowerCase();
      const valor = match[2].trim();

      const campo = camposMapeados[campoOriginal] || campoOriginal;

      if (campo === 'categoryId') {
        const categoria = await this.prisma.category.findFirst({
          where: {
            name: {
              contains: valor,
              mode: 'insensitive',
            },
          },
        });
        if (categoria) {
          condiciones[campo] = categoria.id;
        }
      } else {
        condiciones[campo] = valor;
      }
    }

    return condiciones;
  }
}
