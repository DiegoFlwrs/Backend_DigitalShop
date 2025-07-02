import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async addToCart(
    userId: number,
    productVariantId: number,
    quantity: number = 1,
  ) {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id: productVariantId },
      include: { product: true },
    });

    if (!variant) {
      return { status: false, message: 'Variante de producto no encontrada' };
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
      (item) => item.productVariantId === productVariantId,
    );

    if (existingItem) {
      return this.updateQuantity(
        userId,
        productVariantId,
        existingItem.quantity + quantity,
      );
    }

    const newItem = await this.prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productVariantId,
        quantity,
      },
    });

    return {
      status: true,
      message: 'Producto agregado al carrito',
      item: newItem,
    };
  }

  async removeFromCart(userId: number, productVariantId: number) {
  const cart = await this.prisma.cart.findUnique({
    where: {
      userId: Number(userId)
     },
  });

  if (!cart) {
    return { status: false, message: 'Carrito no encontrado', item: null };
  }

  const deletedItems = await this.prisma.cartItem.deleteMany({
    where: {
      cartId: cart.id,
      productVariantId: Number(productVariantId),
    },
  });

  return {
    status: true,
    message: 'Producto eliminado del carrito',
    item: {
      id: 0,
      cartId: cart.id,
      productVariantId: Number(productVariantId),
      quantity: 0,
      productId: null, // puedes omitir si no es necesario
    },
  };
}

  async getCartItems(userId: number) {
    const cart = await this.prisma.cart.findUnique({
      where: {
        userId: Number(userId),
      },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: {
                  include: { category: true },
                },
              },
            },
          },
        },
      },
    });

    if (!cart) {
      return [];
    }

    return {
      status: true,
      message: 'Carrito cargado',
      items: cart.items.map((item) => ({
        id: item.id,
        productId: item.productVariantId,
        name: item.variant.product.name,
        price: item.variant.price ?? item.variant.product.basePrice,
        imageUrl: item.variant.imageUrl,
        color: item.variant.color,
        size: item.variant.size,
        quantity: item.quantity,
        category: item.variant.product.category.name,
      })),
    };
  }

  async updateQuantity(userId: number, productVariantId: number, quantity: number) {
  if (quantity <= 0) {
    return this.removeFromCart(userId, productVariantId);
  }

  const cart = await this.prisma.cart.findUnique({
    where: { userId },
  });

  if (!cart) {
    return { status: false, message: 'Carrito no encontrado', item: null };
  }

  const variant = await this.prisma.productVariant.findUnique({
    where: { id: productVariantId },
    include: { product: true },
  });

  if (!variant) {
    return { status: false, message: 'Variante no encontrada', item: null };
  }

  const updated = await this.prisma.cartItem.updateMany({
    where: { cartId: cart.id, productVariantId },
    data: { quantity },
  });

  if (updated.count === 0) {
    return { status: false, message: 'Producto no encontrado en el carrito', item: null };
  }

  return {
    status: true,
    message: 'Cantidad actualizada',
    item: {
      id: 0, // opcional si no tienes el ID original, o busca el `cartItem` luego
      cartId: cart.id,
      productVariantId,
      quantity,
      productId: variant.product.id,
    },
  };
}
}
