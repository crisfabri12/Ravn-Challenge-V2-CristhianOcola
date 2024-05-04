import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma, Order, User } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { PrismaError } from '../../prisma/prisma.error';

interface CartItem {
  productId: number;
  product: {
    price: number;
  };
  quantity: number;
}

@Injectable()
export class OrdersService {
  private logger = new Logger(OrdersService.name);

  constructor(private readonly prismaService: PrismaService) {}

  async createOrder(userId: number, cart: { cartItem: CartItem[], totalPrice: number }): Promise<Order> {
    const items = cart.cartItem.map(({ productId, product: { price }, quantity }) => ({
      productId,
      price,
      quantity,
    }));

    const products = await this.getAvailableProducts(items);

    if (products.length !== items.length) {
      throw new BadRequestException('Unable to create order from cart. One or more products are no longer available');
    }

    const updatedQuantity = this.updateProductStock(products, cart.cartItem);

    const order = await this.prismaService.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: {
          userId,
          total: cart.totalPrice,
          orderItem: {
            createMany: {
              data: items,
            },
          },
        },
      });

      await Promise.all(updatedQuantity.map(({ productId, quantity }) => {
        return tx.product.update({
          where: { id: productId },
          data: { stock: quantity },
        });
      }));

      return createdOrder;
    });

    return order;
  }

  private async getAvailableProducts(items: { productId: number, price: number, quantity: number }[]): Promise<{ id: number, stock: number }[]> {
    const productIds = items.map(({ productId }) => productId);

    return this.prismaService.product.findMany({
      where: {
        id: {
          in: productIds,
        },
        isDisabled: false,
        deletedAt: null,
      },
      select: {
        id: true,
        stock: true,
      },
    });
  }

  private updateProductStock(products: { id: number, stock: number }[], cartItems: CartItem[]): { productId: number, quantity: number }[] {
    return cartItems.map(({ productId, quantity }) => {
      const product = products.find(({ id }) => id === productId);
      if (!product || product.stock < quantity) {
        const availableStock = product ? product.stock : 0;
        this.logger.error(`Unable to create order from cart. Not enough stock (required ${quantity}, ${availableStock} available) for product ${productId}`);
        throw new BadRequestException(`Not enough stock for product ${productId}`);
      }
      return { productId, quantity: product.stock - quantity };
    });
  }

  async getOrderForUser(userId: number): Promise<Order[]> {
    const user = await this.getUserById(userId);

    const orders = await this.prismaService.order.findMany({
      where: { userId },
      include: { orderItem: { include: { product: true } } },
    });

    this.logger.log(`Found orders for user ${userId}`);
    this.logger.log(orders);
    return orders;
  }

  private async getUserById(userId: number): Promise<User> {
    try {
      return await this.prismaService.user.findFirstOrThrow({ where: { id: userId } });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === PrismaError.ModelDoesNotExist) {
        throw new NotFoundException(`${userId} does not exist.`);
      }
      throw err;
    }
  }
}
