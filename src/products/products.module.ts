import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProductsController } from './controllers/products.controller';
import { ProductsService } from './services/products.service';
import { AwsModule } from '../config/aws/aws.module';


@Module({
  imports: [AwsModule],
  providers: [AwsModule,ProductsService, PrismaService],
  controllers: [ProductsController],
  exports: [ProductsService],
})
export class ProductsModule {}