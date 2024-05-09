import { Injectable, OnModuleInit } from '@nestjs/common';
import { Prisma, PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';


@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }

  async cleanDb() {
    this.$transaction([
      this.session.deleteMany(),
      this.cartItem.deleteMany(),
      this.cart.deleteMany(),
      this.orderItem.deleteMany(),
      this.order.deleteMany(),
      this.image.deleteMany(),
      this.likesOnProduct.deleteMany(),
      this.product.deleteMany(),
      this.category.deleteMany(),
      this.user.deleteMany(),
    ]);

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

  async seedCategory(){
    await this.$queryRaw`ALTER SEQUENCE "Category_id_seq" RESTART WITH 1`;
    return this.category.createMany({
      data: [
        { name: 'Action', slug: 'action' },
        { name: 'Drama', slug: 'drama' },
        { name: 'Comedy', slug: 'comedy' },
      ],
    });
  }
  
  async seedBooks() {
    await this.$queryRaw`ALTER SEQUENCE "Product_id_seq" RESTART WITH 1`;
    return this.product.createMany({
      data: [
        {
          name: 'The Great Gatsby',
          description: 'The Great Gatsby',
          price: 10.99,
          stock: 20,
          categoryId: 1,
        },
        {
          name: 'To Kill a Mockingbird',
          description: 'To Kill a Mockingbird',
          price: 9.99,
          stock: 15,
          categoryId: 1,
        },
        {
          name: '1984',
          description: '1984',
          price: 11.99,
          stock: 10,
          categoryId: 2,
        },
        {
          name: 'The Catcher in the Rye',
          description: 'The Catcher in the Rye',
          price: 12.99,
          stock: 8,
          categoryId: 2,
        },
        {
          name: 'Pride and Prejudice',
          description: 'Pride and Prejudice',
          price: 8.99,
          stock: 12,
          categoryId: 1,
        },
        {
          name: 'To the Lighthouse',
          description: 'To the Lighthouse',
          price: 10.49,
          stock: 7,
          categoryId: 1,
        },
        {
          name: 'Out of Stock Book',
          description: 'Out of Stock Book',
          price: 5.99,
          stock: 0,
          categoryId: 2,
        },
        {
          name: 'Deleted Book',
          description: 'Deleted Book',
          price: 7.99,
          stock: 0,
          categoryId: 3,
        },
      ],
    });
  }
  
}
