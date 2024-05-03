import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../dto/create-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';

type User = any;
@Injectable()
export class UsersService {
  private logger = new Logger(UsersService.name);
  constructor(
    private prisma: PrismaService,
  ) {}
  async findOne(email: string): Promise<User | undefined> {
    return this.prisma.user.findFirst({
      where: {
        email: email.toLowerCase(),
      },
    });
  }

  async getById(id: number): Promise<User | undefined> {
    return this.prisma.user.findFirst({
      where: {
        id,
      },
    });
  }

  async updatePassword(id: number, password: string): Promise<User> {
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

  async create(user: CreateUserDto): Promise<User | undefined> {
    const hashedPassword = await bcrypt.hash(user.password, 12);
    return this.prisma.user.create({
      data: {
        email: user.email.toLowerCase(),
        name: user.name.toLocaleLowerCase(),
        lastName: user.lastname.toLocaleLowerCase(),
        password: hashedPassword,
      },
    });
  }

  
}