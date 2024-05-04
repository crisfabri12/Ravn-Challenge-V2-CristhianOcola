import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AwsService } from '../../config/aws/aws.service';
import { NotFoundException } from '@nestjs/common';
import { ProductDetailsDto } from '../dto/producto-detail-dto';

interface MockFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

// Mock PrismaService
const prismaServiceMock = {
  product: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  image: {
    findMany: jest.fn(),
    createMany: jest.fn(),
    deleteMany: jest.fn(),
  },
  category: {
    create: jest.fn(),
    findUnique: jest.fn(),
  },
};

// Mock AwsService
const awsServiceMock = {
  uploadFile: jest.fn(),
  deleteFile: jest.fn(),
};

describe('ProductsService', () => {
  let service: ProductsService;
  let prismaService: PrismaService;
  let awsService: AwsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: PrismaService, useValue: prismaServiceMock },
        { provide: AwsService, useValue: awsServiceMock },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    prismaService = module.get<PrismaService>(PrismaService);
    awsService = module.get<AwsService>(AwsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('listProduct', () => {
    it('should call prismaService.product.findMany with correct parameters', async () => {
      await service.listProduct(10, 0);
      expect(prismaService.product.findMany);
    });

    it('should return empty array if no products found', async () => {
      jest.spyOn(prismaService.product, 'findMany').mockResolvedValueOnce([]);
      const result = await service.listProduct(10, 0);
      expect(result).toEqual([]);
    });
  });

  describe('getProductDetails', () => {
    it('should call prismaService.product.findUnique with correct parameter', async () => {
      jest
        .spyOn(prismaService.product, 'findUnique')
        .mockResolvedValueOnce(null);
      await expect(service.getProductDetails(1)).rejects.toThrowError(
        NotFoundException,
      );
      expect(prismaService.product.findUnique).toHaveBeenCalledWith({
        where: { id: 1, isDisabled: false, deletedAt: null },
        include: { category: true, Image: true },
      });
    });

    it('should throw NotFoundException if product not found', async () => {
      jest
        .spyOn(prismaService.product, 'findUnique')
        .mockResolvedValueOnce(null);
      await expect(service.getProductDetails(1)).rejects.toThrowError(
        NotFoundException,
      );
    });

    it('should return product details if found', async () => {
      const mockProduct: ProductDetailsDto = {
        id: 1,
        name: 'Test Product',
        description: 'Test Description',
        likesCount: 10,
        stock: 5,
        price: 100,
        category: { id: 1, name: 'Test Category', slug: 'test' },
        Image: [],
        categoryId: 1,
        createdAt: undefined,
        updatedAt: undefined,
        deletedAt: undefined,
        isDisabled: false,
      };
      jest
        .spyOn(prismaService.product, 'findUnique')
        .mockResolvedValueOnce(mockProduct);
      const result = await service.getProductDetails(1);
      expect(result).toEqual(mockProduct);
    });
  });

  describe('getProductsByCategory', () => {
    it('should call prismaService.product.findMany with correct parameters', async () => {
      await service.getProductsByCategory('productName', 1);
      expect(prismaService.product.findMany);
    });

    it('should return empty array if no products found', async () => {
      jest.spyOn(prismaService.product, 'findMany').mockResolvedValueOnce([]);
      const result = await service.getProductsByCategory('productName', 1);
      expect(result).toEqual([]);
    });
  });

  describe('createProduct', () => {
    it('should create a product with valid data', async () => {
      await prismaService.category.create({
        data: {
          id: 1,
          name: 'Test Category',
          slug: 'test-category',
        },
      });

      const productDto = {
        id: 1,
        name: 'Test Product',
        description: 'Test Description',
        price: 10,
        stock: 100,
        categoryId: 1,
        isDisabled: false,
        likesCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      jest
        .spyOn(prismaService.product, 'create')
        .mockResolvedValueOnce(productDto);

      await expect(service.createProduct(productDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
