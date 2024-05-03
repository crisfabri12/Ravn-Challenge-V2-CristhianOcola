import { Injectable, OnModuleInit } from '@nestjs/common';
import { Prisma, PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
/* istanbul ignore file */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }

  async cleanDb() {
    this.$transaction([]);
  }

  async seedUsers() {
    const hashedPassword = await bcrypt.hash('secret_password', 12);
    await this.$queryRaw`ALTER SEQUENCE "User_id_seq" RESTART WITH 1`;
    return this.user.createMany({
      data: [
        {
          email: 'client@example.com',
          name: 'Cliente',
          lastName: '1',
          password: hashedPassword,
        },
        {
          email: 'manager@example.com',
          name: 'Manager',
          lastName: '1',
          password: hashedPassword,
          role: Role.MANAGER,
        },
        {
          email: 'client2@example.com',
          name: 'Cliente',
          lastName: '2',
          password: hashedPassword,
        },
        {
          email: 'client3@example.com',
          name: 'Cliente',
          lastName: '3',
          password: hashedPassword,
        },
      ],
    });
  }

  /**
   * Create cart for the seeded users
   * - client@example.com has a cart with a single product
   * - client2@example.com has a cart with a disabled product
   * - client3@example.com has a cart with a deleted product
   * - client4@example.com has a cart with a single product with quantity greater than the stock
   */
  /*
  async seedCart() {
    await this.cart.create({
      data: {
        userId: 1,
        cartItem: {
          create: [
            {
              productId: 1,
              quantity: 1,
            },
          ],
        },
      },
    });

    await this.cart.create({
      data: {
        userId: 3,
        cartItem: {
          create: [
            {
              productId: 7,
              quantity: 1,
            },
          ],
        },
      },
    });

    await this.cart.create({
      data: {
        userId: 4,
        cartItem: {
          create: [
            {
              productId: 8,
              quantity: 1,
            },
          ],
        },
      },
    });

    await this.cart.create({
      data: {
        userId: 5,
        cartItem: {
          create: [
            {
              productId: 1,
              quantity: 5,
            },
          ],
        },
      },
    });
  }

  async seedOrder() {
    await this.order.create({
      data: {
        userId: 1,
        total: 99,
        orderItem: {
          create: {
            userId: 1,
            productId: 1,
            price: 99,
            quantity: 1,
          },
        },
      },
    });
  }

  async seedProducts() {
    await this.$queryRaw`ALTER SEQUENCE "Product_id_seq" RESTART WITH 1`;
    await this.product.create({
      data: {
        name: 'active_product_1',
        price: 99,
        stock: 3,
        category: {
          create: {
            name: 'Sample Category 1',
            slug: 'sample-category-1',
          },
        },
        Image: {
          create: [
            {
              url: 'url:image_for_product_1',
              filename: 'image_for_product_1',
            },
          ],
        },
      },
    });

    await this.product.create({
      data: {
        name: 'active_product_2',
        price: 99,
        stock: 5,
        category: {
          connect: {
            slug: 'sample-category-1',
          },
        },
      },
    });

    await this.product.create({
      data: {
        name: 'active_product_3',
        price: 99,
        stock: 1,
        category: {
          connect: {
            slug: 'sample-category-1',
          },
        },
      },
    });

    await this.product.create({
      data: {
        name: 'active_product_4',
        price: 99,
        stock: 1,
        category: {
          connect: {
            slug: 'sample-category-1',
          },
        },
      },
    });

    await this.product.create({
      data: {
        name: 'active_product_5',
        price: 99,
        stock: 1,
        category: {
          connect: {
            slug: 'sample-category-1',
          },
        },
      },
    });

    await this.product.create({
      data: {
        name: 'active_product_6',
        price: 99,
        stock: 1,
        category: {
          create: {
            name: 'Sample Category 2',
            slug: 'sample-category-2',
          },
        },
      },
    });

    await this.product.create({
      data: {
        name: 'disabled_product_1',
        price: 99 ,
        stock: 3,
        isDisabled: true,
        category: {
          connect: {
            slug: 'sample-category-1',
          },
        },
      },
    });

    await this.product.create({
      data: {
        name: 'deleted_product_1',
        price: 99,
        stock: 0,
        deletedAt: new Date(),
        category: {
          connect: {
            slug: 'sample-category-1',
          },
        },
      },
    });
  }

  productSoftDeleteMiddleware: Prisma.Middleware = async (params, next) => {
    if (params.model !== 'Product') {
      return next(params);
    }
    if (params.action == 'delete') {
      return next({
        ...params,
        action: 'update',
        args: {
          ...params.args,
          data: {
            deletedAt: new Date(),
          },
        },
      });
    }
    return next(params);
  };*/
}
