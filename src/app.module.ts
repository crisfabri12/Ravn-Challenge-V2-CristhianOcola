import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigService } from './config/config.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/user.module';
import { DatabaseModule } from './database/database.module';
import { JwtStrategy } from './auth/jwt.strategy';
import { PrismaService } from './prisma/prisma.service';
import configuration from './configuration';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    AuthModule,
    UsersModule,
    DatabaseModule,
    ConfigService
  ],
  controllers: [AppController],
  providers: [
    ConfigService,
    AppService,
    JwtStrategy,
    PrismaService],
})
export class AppModule {
  static port: number | string;

  constructor() {
    AppModule.port = process.env.PORT;
  }
}
