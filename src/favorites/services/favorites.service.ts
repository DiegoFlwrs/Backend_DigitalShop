import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
@Injectable()
export class FavoritesService {
  constructor(private prisma: PrismaService) {}

  async addFavorite(userId: number, productId: number) {
    await this.prisma.favorite.create({
      data: {
        userId,
        productId,
      },
      include: {
        product: true, // Incluye los datos del producto
      },
    });
    return { status: true, message: 'Favorite added successfully' };
  }

  async removeFavorite(userId: number, productId: number) {
    await this.prisma.favorite.delete({
      where: {
        userId_productId: {
          // Usa la clave compuesta
          userId,
          productId,
        },
      },
    });
    return { status: true, message: 'Favorite removed successfully' };
  }

  async getUserFavorites(userId: number) {
  const favorites = await this.prisma.favorite.findMany({
    where: { userId },
    include: {
      product: {
        include: {
          category: true,
          variants: true,
        }
      }
    }
  });

  // Retornamos solo el producto (ya viene con category incluido)
  return favorites.map(fav => fav.product);
}

  async isFavorite(userId: number, productId: number) {
    const fav = await this.prisma.favorite.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });
    return { isFavorite: !!fav };
  }
}
