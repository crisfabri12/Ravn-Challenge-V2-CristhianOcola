import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrdersService } from './services/order.service';
import { OrdersController } from './controllers/orders.controller';

@Module({
  providers: [OrdersService, PrismaService],
  controllers: [OrdersController],
  exports: [OrdersService],
})
export class OrdersModule {}
