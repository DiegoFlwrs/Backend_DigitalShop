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

  async getFavoritesByCategoryUser(userId: number) {
  const data = await this.prisma.favorite.groupBy({
    by: ['productId'],
    where: { 
      userId: Number(userId)
     },  // <--- filtro aquí por usuario
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

  const result: Record<string, number> = {};
  for (const product of products) {
    const categoryName = product.category.name;
    const count = data.find((d) => d.productId === product.id)?._count.productId ?? 0;
    if (result[categoryName]) {
      result[categoryName] += count;
    } else {
      result[categoryName] = count;
    }
  }

  return result; // Ej: { "Ropa": 5, "Zapatos": 2 } solo para este usuario
}


  async getFavoritesByColor() {
  const data = await this.prisma.favorite.groupBy({
    by: ['productId'],
    _count: { productId: true },
  });

  const productIds = data.map((d) => d.productId);

  // Traemos todas las variantes con sus colores y el producto relacionado
  const variants = await this.prisma.productVariant.findMany({
    where: { productId: { in: productIds } },
    select: {
      color: true,
      productId: true,
    },
  });

  const result: Record<string, number> = {};

  for (const variant of variants) {
    const color = variant.color ?? 'Sin color';
    const count =
      data.find((d) => d.productId === variant.productId)?._count.productId ??
      0;

    if (result[color]) {
      result[color] += count;
    } else {
      result[color] = count;
    }
  }

  return result; // Ejemplo: { "Rojo": 5, "Azul": 3 }
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

  async getUserSpendData(userId: number) {
    const orders = await this.prisma.order.findMany({
      where: { userId },
      select: { total: true, createdAt: true },
    });

    const payments = await this.prisma.payment.findMany({
      where: { userId },
      select: { amount: true, createdAt: true },
    });

    return {
      orderCount: orders.length,
      totalSpent: payments.reduce((sum, p) => sum + p.amount, 0),
      averageSpend:
        orders.length > 0
          ? payments.reduce((sum, p) => sum + p.amount, 0) / orders.length
          : 0,
    };
  }

  async getUserPredictionData(userId: number) {
  const favoritesByCategory = await this.getFavoritesByCategoryUser(userId);  // ahora por usuario
  const spendData = await this.getUserSpendData(userId);

  return {
    favorites: favoritesByCategory,
    orderCount: spendData.orderCount,
    totalSpent: spendData.totalSpent,
    averageSpend: spendData.averageSpend,
  };
}
}
