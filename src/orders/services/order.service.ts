import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaError } from 'src/prisma/prisma.error';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OrdersService {
  private logger = new Logger(OrdersService.name);

  constructor(private readonly prismaService: PrismaService) {}

  async createOrder(userId: number, cart: any) {
    const items = cart.cartItem.map(
      ({ productId, product: { price }, quantity }) => ({
        productId,
        price,
        quantity,
      }),
    );

    const products = await this.prismaService.product.findMany({
      where: {
        id: {
          in: items.map(({ productId }) => productId),
        },
        isDisabled: false,
        deletedAt: null,
      },
      select: {
        id: true,
        stock: true,
      },
    });

    if (products.length !== items.length) {
      throw new BadRequestException(
        'Unable to create order from cart. One or more products are no longer available',
      );
    }

    const updatedQuantity = cart.cartItem.map(({ productId, quantity }) => {
      const product = products.find(({ id }) => id === productId);
      if (!product || product.stock < quantity) {
        const availableStock = product ? product.stock : 0;
        this.logger.error(
          `Unable to create order from cart. Not enough stock (required ${quantity}, ${availableStock} available) for product ${productId}`,
        );
        throw new BadRequestException(
          `Not enough stock for product ${productId}`,
        );
      }
      return { productId, quantity: product.stock - quantity };
    });

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

      await Promise.all(
        updatedQuantity.map(({ productId, quantity }) => {
          return tx.product.update({
            where: { id: productId },
            data: { stock: quantity },
          });
        }),
      );

      return createdOrder;
    });

    return order;
  }

  async getOrderForUser(userId: number) {
    await this.prismaService.user
      .findFirstOrThrow({ where: { id: userId } })
      .catch((err) => {
        if (
          err instanceof Prisma.PrismaClientKnownRequestError &&
          err.code === PrismaError.ModelDoesNotExist
        ) {
          throw new NotFoundException(`${userId} does not exist.`);
        }
        throw err;
      });

    const orders = await this.prismaService.order.findMany({
      where: { userId },
      include: { orderItem: { include: { product: true } } },
    });

    this.logger.log(`Found orders for user ${userId}`);
    this.logger.log(orders);
    return orders;
  }
}
