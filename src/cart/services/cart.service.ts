// cart.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async addToCart(userId: number, productId: number, quantity: number = 1) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return { status: false, message: 'Producto no encontrado' };
    }
    let cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: { items: true },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId },
        include: { items: true },
      });
    }

    const existingItem = cart.items.find(
      (item) => item.productId === productId,
    );

    if (existingItem) {
      return this.updateQuantity(
        userId,
        productId,
        existingItem.quantity + quantity,
      );
    }
    const newItem = await this.prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        quantity,
      },
    });

    return {
      status: true,
      message: 'Producto agregado al carrito',
      item: newItem,
    };
  }

  async removeFromCart(userId: number, productId: number) {
    const cart = await this.prisma.cart.findUnique({
      where: { 
        userId: Number(userId) 
      },
    });
    if (!cart) {
      return { status: false, message: 'Carrito no encontrado' };
    }

    try {
      await this.prisma.cartItem.deleteMany({
        where: {
          cartId: cart.id,
          productId: Number(productId),
        },
      });

      return { status: true, message: 'Producto eliminado del carrito' };
    } catch (e) {
      return {
        status: false,
        message: 'Error al eliminar producto del carrito',
      };
    }
  }

  async getCartItems(userId: number) {
    const cart = await this.prisma.cart.findUnique({
      where: {
        userId: Number(userId),
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    });

    if (!cart) {
      return [];
    }

    return cart.items.map((item) => ({
      id: item.id,
      productId: item.product.id,
      name: item.product.name,
      price: item.product.price,
      imageUrl: item.product.imageUrl,
      quantity: item.quantity,
      category: item.product.category.name,
    }));
  }

  async updateQuantity(userId: number, productId: number, quantity: number) {
    if (quantity <= 0) {
      return this.removeFromCart(userId, productId);
    }

    const cart = await this.prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      return { status: false, message: 'Carrito no encontrado' };
    }

    try {
      const updatedItem = await this.prisma.cartItem.updateMany({
        where: {
          cartId: cart.id,
          productId,
        },
        data: { quantity },
      });

      if (updatedItem.count === 0) {
        return {
          status: false,
          message: 'Producto no encontrado en el carrito',
        };
      }

      return {
        status: true,
        message: 'Cantidad actualizada',
        item: { productId, quantity },
      };
    } catch (e) {
      return { status: false, message: 'Error al actualizar cantidad' };
    }
  }
}
