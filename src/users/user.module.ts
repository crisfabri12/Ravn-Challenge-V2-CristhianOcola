import { Module } from '@nestjs/common';
import { UsersService } from './services/user.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersController } from './controllers/user.controller';


@Module({
  imports: [],
  providers: [UsersService, PrismaService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}