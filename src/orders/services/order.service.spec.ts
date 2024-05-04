import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './order.service';
import { PrismaService } from '../../prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Role } from '../../auth/types/roles.enum';

const prismaMock = {
  product: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  order: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
  user: {
    findFirstOrThrow: jest.fn(),
  },
  // Add the missing method to match the Prisma Service type
  $transaction: jest.fn(),
};
describe('OrdersService', () => {
  let service: OrdersService;
  let prismaService: Partial<PrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();
    prismaService = module.get<PrismaService>(PrismaService);
    service = module.get<OrdersService>(OrdersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createOrder', () => {

    it('should throw BadRequestException if product is not available', async () => {
      const mockCart = {
        cartItem: [
          {
            cartId: 1,
            productId: 1,
            product: {
              id: 1,
              name: 'Product 1',
              description: 'Description 1',
              price: 10,
              stock: 5,
              categoryId: 1,
              isDisabled: false,
              likesCount: 0,
              createdAt: new Date(),
              updatedAt: new Date(),
              deletedAt: null,
            },
            quantity: 2,
          },
        ],
        totalPrice: 20,
      };
    });

    describe('getOrderForUser', () => {
      it('should return orders for the given user', async () => {
        const mockUserId = 1;
        const mockUser = {
          id: 1,
          email: 'test@example.com',
          password: 'password',
          name: 'Test',
          lastName: 'User',
          role: Role.Client,
        };

        const mockOrders = [
          {
            id: 1,
            userId: 1,
            total: 50,
            createdAt: new Date(),
          },
          {
            id: 2,
            userId: 1,
            total: 30,
            createdAt: new Date(),
          },
        ];

        jest
          .spyOn(prismaService.user, 'findFirstOrThrow')
          .mockResolvedValueOnce(mockUser);

        jest
          .spyOn(prismaService.order, 'findMany')
          .mockResolvedValueOnce(mockOrders);

        await expect(service.getOrderForUser(mockUserId)).resolves.toEqual(
          mockOrders,
        );

        expect(prismaService.user.findFirstOrThrow).toHaveBeenCalledWith({
          where: { id: mockUserId },
        });
        expect(prismaService.order.findMany).toHaveBeenCalledWith({
          where: { userId: mockUserId },
          include: { orderItem: { include: { product: true } } },
        });
      });
    });
  });
});
