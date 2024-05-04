import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from '../services/products.service';
import { ProductDetailsDto } from '../dto/producto-detail-dto';
import { PaginationParamsDto } from '../dto/pagination-param-dto';

// Mocked UploadedFile object
const uploadedFile: any = {
  name: 'example.jpg',
  mimetype: 'image/jpeg',
  size: 1024,
  mv: jest.fn(),
};

describe('ProductsController', () => {
  let controller: ProductsController;
  let productService: ProductsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: {
            listProduct: jest.fn(),
            getProductsByCategory: jest.fn(),
            getProductDetails: jest.fn(),
            createProduct: jest.fn(),
            updateProduct: jest.fn(),
            addImagesToProduct: jest.fn(),
            removeImagesFromProduct: jest.fn(),
            deleteProduct: jest.fn(),
            likeProduct: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
    productService = module.get<ProductsService>(ProductsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('listProducts', () => {
    it('should call productService.listProduct with correct parameters', async () => {
      const paginationParams: PaginationParamsDto = { cursor: 1, limit: 10 };
      await controller.listProducts(paginationParams);
      expect(productService.listProduct).toHaveBeenCalledWith(10, 1);
    });
  });

  describe('searchProducts', () => {
    it('should call productService.getProductsByCategory with correct parameters', async () => {
      const productName = 'example product';
      const categoryId = 1;
      await controller.searchProducts(productName, categoryId);
      expect(productService.getProductsByCategory).toHaveBeenCalledWith(productName, categoryId);
    });
  });

  describe('getProductDetails', () => {
    it('should call productService.getProductDetails with correct parameter', async () => {
      const productId = 1;
      await controller.getProductDetails(productId);
      expect(productService.getProductDetails).toHaveBeenCalledWith(productId);
    });
  });

  describe('createProduct', () => {
    it('should call productService.createProduct with correct parameters', async () => {
      const createProductDto = {
        name: 'Test Product',
        description: 'Test Description',
        price: 10.99,
        stock: 100,
        categoryId: 1,
      };
      await controller.createProduct(createProductDto, [uploadedFile]);
      expect(productService.createProduct).toHaveBeenCalledWith(createProductDto, [uploadedFile]);
    });
  });

  describe('updateProduct', () => {
    it('should call productService.updateProduct with correct parameters', async () => {
      const productId = 1;
      const productDetailsDto = {
        id: 1,
        name: 'Updated Product',
        description: 'Updated Description',
        category: { id: 1, name: 'Category Name', slug: 'category-slug' },
        categoryId: 1,
        price: 19.99,
        stock: 50,
        likesCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        isDisabled: false,
        Image: [{ url: 'image-url', id: 'image-id', filename: 'image-filename', productId: 1 }],
      };
      await controller.updateProduct(productId, productDetailsDto);
      expect(productService.updateProduct).toHaveBeenCalledWith(productId, productDetailsDto);
    });
  });

  describe('addImagesToProduct', () => {
    it('should call productService.addImagesToProduct with correct parameters', async () => {
      const productId = 1;
      await controller.addImagesToProduct(productId, [uploadedFile]);
      expect(productService.addImagesToProduct).toHaveBeenCalledWith(productId, [uploadedFile]);
    });
  });

  describe('deleteImageFromProduct', () => {
    it('should call productService.removeImagesFromProduct with correct parameters', async () => {
      const productId = 1;
      await controller.deleteImageFromProduct(productId);
      expect(productService.removeImagesFromProduct).toHaveBeenCalledWith({ id: productId });
    });
  });

  describe('deleteProduct', () => {
    it('should call productService.deleteProduct with correct parameter', async () => {
      const productId = 1;
      await controller.deleteProduct(productId);
      expect(productService.deleteProduct).toHaveBeenCalledWith(productId);
    });
  });

  describe('likeProduct', () => {
    it('should call productService.likeProduct with correct parameters', async () => {
      const productId = 1;
      const userId = 123;
      await controller.likeProduct(productId, userId);
      expect(productService.likeProduct).toHaveBeenCalledWith(userId, productId);
    });
  });
});

