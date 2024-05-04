import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { Exclude, Expose, Transform, Type } from 'class-transformer';

@Expose()
class CategoryDto {
  id: number;
  name: string;
  slug: string;
}

@Exclude()
class ImageDto {
  @Expose()
  url: string;

  @Expose()
  id: string;
  filename: string;
  productId: number;
}

@Exclude()
export class ProductDetailsDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  description: string;

  @Expose()
  @Type(() => CategoryDto)
  category: CategoryDto;

  @Expose()
  price: number;

  @Expose()
  stock: number;

  @Expose()
  likesCount: number;
  @Exclude()
  categoryId: number;
  @Exclude()
  createdAt: Date;
  @Exclude()
  updatedAt: Date;
  @Exclude()
  deletedAt: Date;
  @Exclude()
  isDisabled: boolean;

  @Expose()
  @Type(() => ImageDto)
  Image: ImageDto[];
}
