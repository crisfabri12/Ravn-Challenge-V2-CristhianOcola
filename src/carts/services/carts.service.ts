import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { OrdersService } from '../../orders/services/order.service';
import { PrismaError } from '../../prisma/prisma.error';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CartsService {
  private logger = new Logger(CartsService.name);

  constructor(
    private readonly ordersService: OrdersService,
    private readonly prismaService: PrismaService,
  ) {}

  async checkoutCart(userId: number) {
    const cart = await this.getCart(userId);
    const order = await this.ordersService.createOrder(userId, cart);
    await this.deleteCart(userId);
    return order;
  }

  async deleteCart(userId: number) {
    try {
      await this.prismaService.cart.delete({
        where: { userId },
      });
    } catch (err) {
      this.logger.log(`The cart for the ${userId} does not exist`);
    }
    return await this.getOrCreateCart(userId);
  }

  async getCart(userId: number) {
    const cart = await this.prismaService.cart.findUniqueOrThrow({
      where: { userId },
      include: {
        cartItem: {
          include: {
            product: {
              include: { category: true },
            },
          },
          where: { product: { isDisabled: false, deletedAt: null } },
        },
      },
    });
    const totalPrice = cart.cartItem.reduce(
      (acc, { quantity, product }) => acc + quantity * product.price,
      0,
    );
    return { ...cart, totalPrice };
  }

  async getOrCreateCart(userId: number) {
    const cart = await this.prismaService.cart.upsert({
      where: { userId },
      update: {},
      create: { userId },
      include: {
        cartItem: {
          include: {
            product: {
              include: { category: true },
            },
          },
          where: { product: { isDisabled: false, deletedAt: null } },
        },
      },
    });

    const totalPrice = cart.cartItem.reduce(
      (acc, { quantity, product }) => acc + quantity * product.price,
      0,
    );
    return { ...cart, totalPrice };
  }

  async updateItemCart(userId: number, { products }) {
    const { id: cartId } = await this.getOrCreateCart(userId);
    if (products.length === 0) {
      throw new BadRequestException('The cart does not include any products');
    }
    for (const { productId, quantity } of products) {
      if (quantity < 1) {
        try {
          await this.prismaService.cartItem.delete({
            where: { cartId_productId: { cartId, productId } },
          });
        } catch (err) {
          if (
            err instanceof PrismaClientKnownRequestError &&
            err.code === PrismaError.ModelDoesNotExist
          ) {
            throw new BadRequestException(
              `Unable to update the cart. The product ${productId} does not exist`,
            );
          }
        }
      } else {
        try {
          await this.prismaService.cartItem.upsert({
            where: { cartId_productId: { cartId, productId } },
            update: { quantity },
            create: { cartId, productId, quantity },
          });
        } catch (err) {
          if (
            err instanceof PrismaClientKnownRequestError &&
            err.code === PrismaError.ForeignKeyConstraintError
          ) {
            throw new BadRequestException(
              `Unable to update the cart. Product ${productId} does not exist`,
            );
          }
        }
      }
    }
    return await this.getCart(userId);
  }
}
