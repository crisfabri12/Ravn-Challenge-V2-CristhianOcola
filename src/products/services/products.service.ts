import {
  BadRequestException,
  ConflictException,
  FileTypeValidator,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import {
  forkJoin,
  lastValueFrom,
  mergeMap,
  of,
  reduce,
  switchMap,
  tap,
} from 'rxjs';
import * as _ from 'lodash';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProductDto } from '../dto/create-product-dto';
import { PrismaError } from 'src/prisma/prisma.error';
import { UpdateProductDto } from '../dto/update-product-dto';
import { DeleteImageDto } from '../dto/delete-image-dto';
import { AwsService } from 'src/config/aws/aws.service';

@Injectable()
export class ProductsService {
  private logger = new Logger(ProductsService.name);

  constructor(
    private prisma: PrismaService,
    private aws: AwsService,
  ) {}

  async listProduct(limit: number, cursor?: number, filter: object = {}) {
    filter = {
      isDisabled: false,
      deletedAt: null,
      ...filter,
    };

    const findOptions = {
      take: limit,
      skip: cursor > 0 ? 1 : undefined,
      cursor: cursor > 0 ? { id: cursor } : undefined,
      where: filter,
      include: {
        category: true,
        Image: true,
      },
    };

    return this.prisma.product.findMany(findOptions);
  }

  async getProductDetails(productId: number) {
    const product = await this.prisma.product.findUnique({
      where: {
        id: productId,
        isDisabled: false,
        deletedAt: null,
      },
      include: {
        category: true,
        Image: true,
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with id ${productId} not found`);
    }

    return product;
  }

  async getProductsByCategory(productName: string, category?: number) {
    return this.prisma.product.findMany({
      where: {
        name: {
          contains: productName,
          mode: 'insensitive',
        },
        isDisabled: false,
        deletedAt: null,
        category: {
          id: category,
        },
      },
    });
  }

  async createProduct(
    product: CreateProductDto,
    files?: Array<Express.Multer.File>,
  ) {
    await this.validateFiles(files);
    let createdProduct;
    let categoryId;
    // check if category exists
    try {
      categoryId = await this.getCategoryId(product.categoryId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(
          `Not found product - ${product.categoryId}`,
        );
      }
      throw error;
    }
    try {
      // Create prduct
      createdProduct = await this.prisma.product.create({
        data: {
          name: product.name,
          description: product.description,
          price: product.price,
          stock: product.stock,
          categoryId: product.categoryId,
        },
      });
      // Upload de Image
      if (files && files.length > 0) {
        await this.addImagesToProduct(createdProduct.id, files);
      } else {
        this.logger.log(
          `No hay archivos para el producto ${createdProduct.id}. Saltando`,
        );
      }
    } catch (error) {
      // Manejar errores de base de datos u otros errores
      throw new Error(`Error al crear el producto` + error);
    }
    return this.getProductDetails(createdProduct.id);
  }

  async updateProduct(productId: number, details: UpdateProductDto) {
    try {
      return await this.prisma.product.update({
        where: {
          id: productId,
        },
        data: {
          ...details,
        },
      });
    } catch (err) {
      this.handleNotFoundException(err, productId);
    }
  }

  async addImagesToProduct(id: number, files: Array<Express.Multer.File>) {
    const validator = new FileTypeValidator({
      fileType: /(jpg|jpeg|png|webp)$/,
    });

    if (files != undefined && files.length > 0) {
      for (const file of files) {
        if (!validator.isValid(file)) {
          throw new BadRequestException(
            'The file is not valid. Only images are allowed',
          );
        }
      }
    }
    return lastValueFrom(
      of(...files).pipe(
        mergeMap(async (file) => await this.uploadFile(file)),
        reduce(
          (acc, i) => [
            ...acc,
            { url: i.Location, filename: i.Key, productId: id },
          ],
          [],
        ),
        switchMap(async (data) => {
          return this.prisma.image.createMany({
            data,
          });
        }),
      ),
    );
  }

  async removeImagesFromProduct(deleteImageParameters: DeleteImageDto) {
    const productImage = await this.prisma.image.findMany({
      where: deleteImageParameters,
      select: {
        id: true,
        filename: true,
      },
    });

    if (deleteImageParameters.id) {
      const dbImages = productImage.map(({ id }) => id);
      if (!dbImages.includes(deleteImageParameters.id)) {
        throw new NotFoundException(
          `The image ${deleteImageParameters.id} was not found`,
        );
      }
    }

    return await lastValueFrom(
      of(...productImage).pipe(
        mergeMap(({ id, filename }) =>
          forkJoin([of(id), this.aws.deleteFile(filename)]),
        ),
        reduce((acc, [id, _]) => [...acc, id], []),
        switchMap(async (result) =>
          this.prisma.image.deleteMany({
            where: {
              id: {
                in: result,
              },
            },
          }),
        ),
      ),
    );
  }

  async deleteProduct(productId: number) {
    try {
      return await this.prisma.product.delete({
        where: {
          id: productId,
        },
      });
    } catch (err) {
      this.handleNotFoundException(err, productId);
    }
  }

  async likeProduct(userId: number, productId: number) {
    try {
      // Verificar si el producto existe antes de continuar
      await this.getProductDetails(productId);

      // Crear el like en la base de datos
      await this.prisma.likesOnProduct.create({
        data: {
          product: {
            connect: { id: productId },
          },
          user: {
            connect: { id: userId },
          },
        },
      });

      // Incrementar el contador de likes del producto
      await this.prisma.product.update({
        where: { id: productId },
        data: { likesCount: { increment: 1 } },
      });

      return null;
    } catch (error) {
      // Manejar errores específicos de Prisma
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
          case 'P2003': // UniqueConstraintViolation
            throw new ConflictException(
              `El usuario ya ha dado "like" al producto con ID ${productId}`,
            );
          case 'P2016': // RelatedRecordNotFound
            throw new NotFoundException(
              `Producto con ID ${productId} no encontrado`,
            );
          default:
            throw error;
        }
      }
      throw error;
    }
  }

  private async uploadFile(file: Express.Multer.File) {
    const extension = file.originalname.split('.').slice(-1);
    const filename = `${uuidv4()}.${extension}`;
    return await this.aws.uploadFile(file.buffer, filename);
  }

  private handleNotFoundException(err: Error, productId: number) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === PrismaError.ModelDoesNotExist
    ) {
      throw new NotFoundException(productId);
    }
    throw err;
  }

  private async getCategoryId(categoryId: number) {
    const category = await this.prisma.category.findUnique({
      where: {
        id: categoryId,
      },
    });

    if (!category) {
      throw new NotFoundException();
    }

    return categoryId;
  }

  //VALIDATE FILES

  private async validateFiles(files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      return;
    }

    const validator = new FileTypeValidator({
      fileType: /(jpg|jpeg|png|webp)$/,
    });

    for (const file of files) {
      if (!validator.isValid(file)) {
        throw new BadRequestException(
          'El archivo no es válido. Solo se permiten imágenes',
        );
      }
    }
  }
}
