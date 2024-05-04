import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from '@nestjs/config';
import { CreateUserDto } from '../dto/create-user-dto';
import { PrismaService } from '../../prisma/prisma.service';
import { UsersService } from '../../users/services/user.service';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private configService: ConfigService,
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException();
    }
    const { accessToken, refreshToken } = await this.getJwtTokens(
      user.id,
      user.role,
    );
    return {
      accessToken,
      refreshToken,
    };
  }

  async register(user: CreateUserDto) {
    return await this.usersService.create(user);
  }

  async getUser(id: number) {
    return await this.usersService.getById(id);
  }

  async logout(userId: number): Promise<void> {
    await this.prismaService.session.deleteMany({
      where: {
        userId,
      },
    });
  }

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(email);
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  private async getJwtTokens(userId: number, userRole: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          jti: uuidv4(),
          role: userRole,
        },
        {
          secret: this.configService.get<string>('auth.accessTokenSecret'),
          expiresIn: '150min',
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          jti: uuidv4(),
        },
        {
          secret: this.configService.get<string>('auth.refreshTokenSecret'),
          expiresIn: '7d',
        },
      ),
    ]);

    const { sub, jti, exp } = this.jwtService.decode(refreshToken);

    await this.prismaService.session.create({
      data: {
        userId: sub,
        token: jti,
        expiredAt: new Date(exp * 1000),
      },
    });

    return {
      accessToken,
      refreshToken,
    };
  }
}