import { Module } from '@nestjs/common';
import { OrdersModule } from '../orders/orders.module';
import { OrdersService } from 'src/orders/services/order.service';
import { CartsService } from './services/carts.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CartsController } from './controllers/carts.controller';

@Module({
  imports: [OrdersModule],
  providers: [OrdersService, CartsService, PrismaService],
  controllers: [CartsController],
  exports: [CartsService],
})
export class CartsModule {}
