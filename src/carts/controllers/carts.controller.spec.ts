import { Test, TestingModule } from '@nestjs/testing';
import { CartsController } from './carts.controller';
import { CartsService } from '../services/carts.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { UpdateCartDto } from '../dto/update-cart-dto';
import { CartDto } from '../dto/cart-dto';
import { Role } from '@prisma/client';

// Mock CartsService
const mockCartsService = {
  checkoutCart: jest.fn(),
  updateItemCart: jest.fn(),
  getOrCreateCart: jest.fn(),
  deleteCart: jest.fn(),
};

describe('CartsController', () => {
  let controller: CartsController;
  let cartsService: CartsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CartsController],
      providers: [{ provide: CartsService, useValue: mockCartsService }],
    }).compile();

    controller = module.get<CartsController>(CartsController);
    cartsService = module.get<CartsService>(CartsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('checkoutCart', () => {
    it('should checkout the current user cart and create an order', async () => {
      const mockUserId = 1;

      await controller.checkoutCart(mockUserId);

      expect(cartsService.checkoutCart).toHaveBeenCalledWith(mockUserId);
    });
  });

  describe('updateCart', () => {
    it('should add/update/delete items on the current user cart', async () => {
      const mockUserId = 1;
      const mockUpdateCartDto: UpdateCartDto = {
        products: [{ productId: 1, quantity: 2 }],
      };
      const mockUpdateCartDto2 = {
        totalPrice: 100,
        cartItem: [createMockCartItem({ quantity: 2 })], // Sobrescribe la cantidad
        id: 1,
        userId: mockUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest
        .spyOn(cartsService, 'updateItemCart')
        .mockResolvedValueOnce(mockUpdateCartDto2);

      const result = await controller.updateCart(mockUserId, mockUpdateCartDto);

      expect(cartsService.updateItemCart).toHaveBeenCalledWith(
        mockUserId,
        mockUpdateCartDto,
      );
      expect(result).toEqual(new CartDto(mockUpdateCartDto2));
    });
  });

  describe('getCart', () => {
    it('should get the current user cart with all items and total price', async () => {
      const mockUserId = 1;
      const mockCart = createMockCart({ userId: mockUserId });

      jest
        .spyOn(cartsService, 'getOrCreateCart')
        .mockResolvedValueOnce(mockCart);

      const result = await controller.getCart(mockUserId);

      expect(cartsService.getOrCreateCart).toHaveBeenCalledWith(mockUserId);
      expect(result).toEqual(new CartDto(mockCart));
    });
  });

  describe('deleteCart', () => {
    it('should clear all items in the current user cart', async () => {
      const mockUserId = 1;

      await controller.deleteCart(mockUserId);

      expect(cartsService.deleteCart).toHaveBeenCalledWith(mockUserId);
    });
  });
});

function createMockCartItem(overrides = {}) {
  const mockCartItem = {
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
    quantity: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return { ...mockCartItem, ...overrides };
}

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
