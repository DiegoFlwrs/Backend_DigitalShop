import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class StatisticsService {
  constructor(private prisma: PrismaService) {}

  async getFavoritesByCategory() {
    const data = await this.prisma.favorite.groupBy({
      by: ['productId'],
      _count: { productId: true },
    });

    const productIds = data.map((d) => d.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        name: true,
        category: { select: { id: true, name: true } },
      },
    });

    const result = {};
    for (const product of products) {
      const categoryName = product.category.name;
      const count = data.find((d) => d.productId === product.id)?._count
        .productId ?? 0;
      if (result[categoryName]) {
        result[categoryName] += count;
      } else {
        result[categoryName] = count;
      }
    }

    return result; // Ejemplo: { "Ropa": 15, "Zapatos": 8 }
  }

  async getFavoritesByColor() {
    const data = await this.prisma.favorite.groupBy({
      by: ['productId'],
      _count: { productId: true },
    });

    const productIds = data.map((d) => d.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        color: true,
      },
    });

    const result = {};
    for (const product of products) {
      const color = product.color ?? 'Sin color';
      const count = data.find((d) => d.productId === product.id)?._count.productId ?? 0;
      if (result[color]) {
        result[color] += count;
      } else {
        result[color] = count;
      }
    }

    return result; // Ejemplo: { "Rojo": 5, "Azul": 3, "Sin color": 2 }
  }

  async getProductsByCategory() {
    const data = await this.prisma.product.groupBy({
      by: ['categoryId'],
      _count: { categoryId: true },
    });

    const categoryIds = data.map((d) => d.categoryId);
    const categories = await this.prisma.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true },
    });

    const result = {};
    for (const cat of categories) {
      const count = data.find((d) => d.categoryId === cat.id)?._count.categoryId ?? 0;
      result[cat.name] = count;
    }

    return result; // Ejemplo: { "Ropa": 30, "Zapatos": 15 }
  }
}
