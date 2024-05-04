import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../dto/create-user.dto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findOne(email: string): Promise<any | undefined> {
    return this.prisma.user.findFirst({
      where: {
        email: email.toLowerCase(),
      },
    });
  }

  async getById(id: number): Promise<any | undefined> {
    return this.prisma.user.findUnique({
      where: {
        id,
      },
    });
  }

  async updatePassword(id: number, password: string): Promise<any> {
    const hashedPassword = await bcrypt.hash(password, 12);
    return this.prisma.user.update({
      where: {
        id,
      },
      data: {
        password: hashedPassword,
      },
    });
  }

  async create(user: CreateUserDto): Promise<any | undefined> {
    const hashedPassword = await bcrypt.hash(user.password, 12);
    return this.prisma.user.create({
      data: {
        email: user.email.toLowerCase(),
        name: user.name.toLowerCase(),
        lastName: user.lastName.toLowerCase(),
        password: hashedPassword,
      },
    });
  }
}
