import { Test, TestingModule } from '@nestjs/testing';
import { CartsService } from './carts.service';
import { PrismaService } from '../../prisma/prisma.service';
import { OrdersService } from '../../orders/services/order.service';

describe('CartsService', () => {
  let service: CartsService;
  let prismaService: PrismaService;
  let ordersService: OrdersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CartsService, PrismaService, OrdersService],
    }).compile();

    service = module.get<CartsService>(CartsService);
    prismaService = module.get<PrismaService>(PrismaService);
    ordersService = module.get<OrdersService>(OrdersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('checkoutCart', () => {
    it('should checkout the cart', async () => {
      const mockUserId = 1;
      const mockCart = createMockCart();
      const mockOrder = createMockOrder();

      jest.spyOn(service, 'getCart').mockResolvedValueOnce(mockCart);
      jest.spyOn(ordersService, 'createOrder').mockResolvedValueOnce(mockOrder);
      jest.spyOn(service, 'deleteCart').mockResolvedValueOnce(mockCart);

      const result = await service.checkoutCart(mockUserId);

      expect(service.getCart).toHaveBeenCalledWith(mockUserId);
      expect(ordersService.createOrder).toHaveBeenCalledWith(mockUserId, mockCart);
      expect(service.deleteCart).toHaveBeenCalledWith(mockUserId);
      expect(result).toEqual(mockOrder);
    });
  });

  describe('deleteCart', () => {
    it('should delete the cart', async () => {
      const mockUserId = 1;
      const mockCart = createMockCart({ userId: mockUserId });

      jest.spyOn(prismaService.cart, 'delete').mockResolvedValueOnce(mockCart);
      jest.spyOn(service, 'getOrCreateCart').mockResolvedValueOnce(mockCart);

      const result = await service.deleteCart(mockUserId);

      expect(prismaService.cart.delete).toHaveBeenCalledWith({ where: { userId: mockUserId } });
      expect(service.getOrCreateCart).toHaveBeenCalledWith(mockUserId);
      expect(result).toEqual(mockCart);
    });
  });

  describe('getCart', () => {
    it('should get the cart', async () => {
      const mockUserId = 1;
      const mockCart = createMockCart({ userId: mockUserId });

      jest.spyOn(prismaService.cart, 'findUniqueOrThrow').mockResolvedValueOnce(mockCart);

      const result = await service.getCart(mockUserId);

      expect(prismaService.cart.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { userId: mockUserId },
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
      expect(result).toEqual(mockCart);
    });
  });

  describe('getOrCreateCart', () => {
    it('should get or create the cart', async () => {
      const mockUserId = 1;
      const mockCart = createMockCart({ userId: mockUserId });

      jest.spyOn(prismaService.cart, 'upsert').mockResolvedValueOnce(mockCart);

      const result = await service.getOrCreateCart(mockUserId);

      expect(prismaService.cart.upsert).toHaveBeenCalledWith({
        where: { userId: mockUserId },
        update: {},
        create: { userId: mockUserId },
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
      expect(result).toEqual(mockCart);
    });
  });

  describe('updateItemCart', () => {
    it('should update the cart items', async () => {
      const mockUserId = 1;
      const mockProducts = [{ productId: 1, quantity: 2 }];
      const mockCart = createMockCart({ userId: mockUserId });

      jest.spyOn(service, 'getOrCreateCart').mockResolvedValueOnce(mockCart);
      jest.spyOn(prismaService.cartItem, 'upsert').mockResolvedValueOnce(mockCart.cartItem[0]);
      jest.spyOn(service, 'getCart').mockResolvedValueOnce(mockCart);

      const result = await service.updateItemCart(mockUserId, { products: mockProducts });

      expect(service.getOrCreateCart).toHaveBeenCalledWith(mockUserId);
      expect(prismaService.cartItem.upsert).toHaveBeenCalledWith({
        where: { cartId_productId: { cartId: mockCart.id, productId: mockProducts[0].productId } },
        update: { quantity: mockProducts[0].quantity },
        create: { cartId: mockCart.id, productId: mockProducts[0].productId, quantity: mockProducts[0].quantity },
      });
      expect(service.getCart).toHaveBeenCalledWith(mockUserId);
      expect(result).toEqual(mockCart);
    });
  });

});


function createMockCart(overrides = {}) {
    const mockCart = {
      id: 1,
      userId: 1,
      cartItem: [
        {
          product: {
            category: {
              id: 1,
              name: 'category name',
              slug: 'category-slug',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            id: 1,
            name: 'product name',
            description: 'product description',
            price: 10,
            stock: 20,
            categoryId: 1,
            isDisabled: false,
            likesCount: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: new Date(),
          },
          cartId: 1,
          productId: 1,
          quantity: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      totalPrice: 20,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  
    return { ...mockCart, ...overrides };
  }
  
  function createMockOrder(overrides = {}) {
    const mockOrder = {
      id: 1,
      userId: 1,
      orderItems: [{ productId: 1, quantity: 2, price: 10 }],
      total: 20,
      createdAt: new Date(),
    };
  
    return { ...mockOrder, ...overrides };
  }