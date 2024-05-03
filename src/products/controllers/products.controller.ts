import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '../../auth/types/roles.enum';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../../auth/guards/role.guard';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { GetCurrentUserId } from '../../auth/decorators/get-current-user-id.decorator';
import { ProductsService } from '../services/products.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ValidBody } from '../../utils/decorators';
import { CreateProductDto } from '../dto/create-product-dto';
import { TransformDataInterceptor } from 'src/utils/transform-data.interceptor';
import { PaginationParamsDto } from '../dto/pagination-param-dto';
import { ProductDetailsDto } from '../dto/producto-detail-dto';

@ApiTags('Product')
@Controller('products')
@UseInterceptors(ClassSerializerInterceptor)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}
  @Get('/')
  @ApiOperation({
    summary: 'List products',
  })
  @UseInterceptors(new TransformDataInterceptor(ProductDetailsDto))
  @UsePipes(new ValidationPipe({ transform: true }))
  async listProducts(@Query() { cursor, limit }: PaginationParamsDto) {
    return await this.productsService.listProduct(limit, cursor);
  }

  @ApiOperation({
    summary: 'Search products by category',
  })
  @Get('/search')
  @ApiQuery({
    name: 'q',
    type: 'string',
    description: 'The name of the product',
  })
  @ApiQuery({
    name: 'category',
    type: 'number',
    description: 'The category of the product',
  })
  async searchProducts(
    @Query('q') productName: string,
    @Query('category', ParseIntPipe) category?: number,
  ) {
    return this.productsService.getProductsByCategory(productName, category);
  }

  @Get('/:id')
  @ApiOperation({
    summary: 'Get product details',
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'The id of the product',
  })
  @UseInterceptors(new TransformDataInterceptor(ProductDetailsDto))
  async getProductDetails(@Param('id', ParseIntPipe) productId: number) {
    return await this.productsService.getProductDetails(productId);
  }

  @ApiOperation({
    summary: 'Create a new product',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          default: 'foobar',
        },
        description: {
          type: 'string',
        },
        price: {
          type: 'number',
          default: 999,
        },
        stock: {
          type: 'number',
          default: 10,
        },
        category: {
          type: 'string',
          default: 'snacks',
        },
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @Post('/')
  @ApiBearerAuth('access_token')
  @Roles(Role.Manager)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UseInterceptors(FilesInterceptor('files'))
  async createProduct(
    @Body() product: CreateProductDto,
    @UploadedFiles() files?: Array<Express.Multer.File>,
  ) {
    const createProductDto: CreateProductDto = {
      name: product.name,
      description: product.description,
      price: Number(product.price),
      stock: Number(product.stock),
      categoryId: Number(product.categoryId),
    };
    return this.productsService.createProduct(createProductDto, files);
  }

  @ApiOperation({
    summary: 'Update product information',
  })
  @ApiBearerAuth('access_token')
  @ApiParam({
    name: 'id',
    required: true,
    description: 'The id of the product',
  })
  @Put(':id')
  @Roles(Role.Manager)
  @UseGuards(JwtAuthGuard, RoleGuard)
  async updateProduct(
    @Param('id', ParseIntPipe) productId: number,
    @Body() details: ProductDetailsDto,
  ) {
    return this.productsService.updateProduct(productId, details);
  }

  @ApiOperation({
    summary: 'Add images to product',
  })
  @ApiBearerAuth('access_token')
  @ApiParam({
    name: 'id',
    required: true,
    description: 'The id of the product',
  })
  @ApiConsumes('multipart/form-data')
  @ApiParam({
    name: 'id',
    description: 'The id of the product',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description:
      'The images were successfully uploaded and added to the product',
  })
  @ApiResponse({
    status: 404,
    description:
      "The product that you're trying to upload the image does not exists",
  })
  @ApiResponse({
    status: 500,
    description:
      'An internal server error occurred while trying to upload the image',
  })
  @Post('/images/:id')
  @UseInterceptors(FilesInterceptor('files'))
  @Roles(Role.Manager)
  @UseGuards(JwtAuthGuard, RoleGuard)
  async addImagesToProduct(
    @Param('id', ParseIntPipe) productId: number,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    return this.productsService.addImagesToProduct(productId, files);
  }

  @ApiOperation({
    summary: 'Remove image from product',
  })
  @ApiBearerAuth('access_token')
  @Delete('/images/:id')
  @Roles(Role.Manager)
  @UseGuards(JwtAuthGuard, RoleGuard)
  async deleteImageFromProduct(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.removeImagesFromProduct({ id });
  }

  @ApiOperation({
    summary: 'Delete a product',
  })
  @ApiBearerAuth('access_token')
  @ApiParam({
    name: 'id',
    required: true,
    description: 'The id of the product',
  })
  @Delete('/:id')
  @Roles(Role.Manager)
  @UseGuards(JwtAuthGuard, RoleGuard)
  async deleteProduct(@Param('id', ParseIntPipe) productId: number) {
    return this.productsService.deleteProduct(productId);
  }

  @ApiOperation({
    summary: 'Like a product',
  })
  @ApiBearerAuth('access_token')
  @ApiParam({
    name: 'id',
    required: true,
    description: 'The id of the product',
  })
  @Post('/like/:id')
  @UseGuards(JwtAuthGuard)
  async likeProduct(
    @Param('id', ParseIntPipe) productId: number,
    @GetCurrentUserId() userId: number,
  ) {
    await this.productsService.likeProduct(userId, productId);

    return null;
  }
}
