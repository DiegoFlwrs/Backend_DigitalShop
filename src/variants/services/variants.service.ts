import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class VariantsService {
     constructor(private prisma: PrismaService) {}

  async getVariantsByProduct(productId: number) {
    return this.prisma.productVariant.findMany({
      where: { productId },
      orderBy: [{ color: 'asc' }, { size: 'asc' }],
    });
  }

  async getAvailableColors(productId?: number) {
    const where = productId ? { productId } : {};
    
    const colors = await this.prisma.productVariant.findMany({
      where,
      distinct: ['color'],
      select: { color: true },
      orderBy: { color: 'asc' },
    });
    
    return colors.map(c => c.color);
  }

  async getAvailableSizes(productId?: number) {
    const where = productId ? { productId } : {};
    
    const sizes = await this.prisma.productVariant.findMany({
      where,
      distinct: ['size'],
      select: { size: true },
      orderBy: { size: 'asc' },
    });
    
    return sizes.map(s => s.size);
  }

  async getSizesForColor(productId: number, color: string) {
    const sizes = await this.prisma.productVariant.findMany({
      where: { productId, color },
      distinct: ['size'],
      select: { size: true },
      orderBy: { size: 'asc' },
    });
    
    return sizes.map(s => s.size);
  }

  async getColorsForSize(productId: number, size: string) {
    const colors = await this.prisma.productVariant.findMany({
      where: { productId, size },
      distinct: ['color'],
      select: { color: true },
      orderBy: { color: 'asc' },
    });
    
    return colors.map(c => c.color);
  }

  async getVariantDetails(productId: number, color: string, size: string) {
    return this.prisma.productVariant.findFirst({
      where: {
        productId,
        color,
        size,
      },
    });
  }

  async checkStock(variantId: number, requestedQuantity: number) {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id: variantId },
      select: { stock: true },
    });
    
    return {
      available: variant?.stock! >= requestedQuantity,
      currentStock: variant?.stock,
    };
  }

  async getFirstVariantForColor(productId: number, color: string) {
  const variant = await this.prisma.productVariant.findFirst({
    where: {
      productId,
      color,
    },
    orderBy: [{ size: 'asc' }], // Ordenamos por tamaño para consistencia
  });

  if (!variant) {
    return null;
  }

  // Obtenemos los tamaños disponibles para este color
  const sizes = await this.getSizesForColor(productId, color);

  return {
    id: variant.id,
    imageUrl: variant.imageUrl, // Asumiendo que tienes este campo
    price: variant.price,
    availableSizes: sizes,
  };
}
}
