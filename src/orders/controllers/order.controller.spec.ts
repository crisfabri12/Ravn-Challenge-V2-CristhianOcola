// order.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from './orders.controller';
import { OrdersService } from '../services/order.service';
import { OrderEntity } from '../dto/order-dto';

// Mock OrdersService
const mockOrdersService = {
  getOrderForUser: jest.fn(),
};

describe('OrdersController', () => {
  let controller: OrdersController;
  let ordersService: OrdersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [{ provide: OrdersService, useValue: mockOrdersService }],
    }).compile();

    controller = module.get<OrdersController>(OrdersController);
    ordersService = module.get<OrdersService>(OrdersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getOrders', () => {
    it('should return orders for the current user', async () => {
      const mockUserId = 1;
      const mockOrders = [{ id: 1, userId: 1, total: 50, createdAt: new Date() }];

      jest.spyOn(ordersService, 'getOrderForUser').mockResolvedValueOnce(mockOrders);

      const result = await controller.getOrders(mockUserId);

      expect(result).toEqual(mockOrders.map(order => new OrderEntity(order)));
      expect(ordersService.getOrderForUser).toHaveBeenCalledWith(mockUserId);
    });
  });

  describe('getOrderId', () => {
    it('should return orders for the specified user id', async () => {
      const mockUserId = 2;
      const mockOrders = [{ id: 2, userId: 2, total: 30, createdAt: new Date() }];

      jest.spyOn(ordersService, 'getOrderForUser').mockResolvedValueOnce(mockOrders);

      const result = await controller.getOrderId(mockUserId);

      expect(result).toEqual(mockOrders.map(order => new OrderEntity(order)));
      expect(ordersService.getOrderForUser).toHaveBeenCalledWith(mockUserId);
    });
  });
});
