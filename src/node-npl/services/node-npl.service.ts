import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
const { NlpManager } = require('node-nlp');

@Injectable()
export class NodeNplService {
  private manager: any;

  constructor(private prisma: PrismaService) {
    this.manager = new NlpManager({ languages: ['es'], forceNER: true });
    this.initializeNLP();
  }

  private async initializeNLP() {
    // Entrenamiento de frases para buscar productos
    this.manager.addDocument('es', 'Quiero una camisa %color% %size% %brand%', 'product.query');
    this.manager.addDocument('es', 'Muéstrame una camiseta %color% %size% %brand%', 'product.query');
    this.manager.addDocument('es', 'Estoy buscando una camisa de %color% %size% %brand%', 'product.query');
    this.manager.addDocument('es', 'Quiero una camisa %color%', 'product.query');
    this.manager.addDocument('es', 'Muéstrame algo de color %color%', 'product.query');
    this.manager.addDocument('es', 'Busco ropa de marca %brand%', 'product.query');

    // Colores con sinónimos
    const colores = [
        { base: 'azul', sinonimos: ['azul'] },
        { base: 'rojo', sinonimos: ['rojo', 'roja'] },
        { base: 'verde', sinonimos: ['verde'] },
        { base: 'negro', sinonimos: ['negro', 'negra'] },
        { base: 'blanco', sinonimos: ['blanco', 'blanca'] }, // Asegúrate de que "blanca" esté aquí
        { base: 'amarillo', sinonimos: ['amarillo', 'amarilla'] },
      ];
      colores.forEach(c =>
        this.manager.addNamedEntityText('color', c.base, c.sinonimos)
      );

    // Tallas
    const tallas = ['S', 'M', 'L', 'XL'];
    tallas.forEach(t =>
      this.manager.addNamedEntityText('size', t, [t])
    );

    // Marcas
    const marcas = ['Nike', 'Adidas', 'Puma', 'Reebok'];
    marcas.forEach(m =>
      this.manager.addNamedEntityText('brand', m, [m])
    );

    // Entrenar modelo
    await this.manager.train();
    this.manager.save();
  }

  private getEntityValue(entities: any[], name: string): string | null {
    const entity = entities.find(e => e.entity === name);
    return entity?.option ?? entity?.sourceText ?? null;
  }

  async processQuery(query: string) {
    const response = await this.manager.process('es', query);

    // Debug
    console.log('🧠 NLP RESPONSE:', JSON.stringify(response, null, 2));

    if (response.intent === 'product.query') {
        const color = this.getEntityValue(response.entities, 'color');
        const size = this.getEntityValue(response.entities, 'size');
        const brand = this.getEntityValue(response.entities, 'brand');
        
        // Añadir un log para depurar
        console.log('Color detectado:', color);
        console.log('Tamaño detectado:', size);
        console.log('Marca detectada:', brand);

      const filters: any[] = [];

      // Filtro de color
      if (color) filters.push({ color: { contains: color, mode: 'insensitive' } });
      // Filtro de tamaño
      if (size) filters.push({ size: { contains: size, mode: 'insensitive' } });
      // Filtro de marca
      if (brand) filters.push({ brand: { contains: brand, mode: 'insensitive' } });

      if (filters.length === 0) {
        return {
          message: 'No se detectaron parámetros válidos para la búsqueda. Intenta mencionar color, talla o marca.',
          products: [],
        };
      }

      // Buscar productos en la base de datos usando Prisma
      const products = await this.prisma.product.findMany({
        where: {
          AND: filters,
        },
      });

      // Si hay productos, devolverlos
      if (products.length > 0) {
        return {
          message: `Encontramos ${products.length} producto(s) disponibles.`,
          products: products.map(product => ({
            name: product.name,
            description: product.description,
            price: product.price,
            stock: product.stock,
          })),
        };
      } else {
        return {
          message: 'No encontramos productos que coincidan con la búsqueda.',
          products: [],
        };
      }
    }

    // En caso de no entender la consulta
    return {
      message: 'No entendí tu búsqueda. Intenta describir mejor lo que deseas.',
      products: [],
    };
  }
}
