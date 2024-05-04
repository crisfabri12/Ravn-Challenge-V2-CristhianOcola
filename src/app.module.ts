import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigService } from './config/config.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/user.module';
import { DatabaseModule } from './database/database.module';
import { JwtStrategy } from './auth/jwt.strategy';
import configuration from './configuration';
import { ConfigModule } from '@nestjs/config';
import { AwsModule } from './config/aws/aws.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { CartsModule } from './carts/carts.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    AuthModule,

    UsersModule,
    ProductsModule,
    ConfigService,
    DatabaseModule,
    AwsModule,
    CartsModule,
    OrdersModule,
  ],
  controllers: [AppController],
  providers: [
    ConfigService,
    AppService,
    JwtStrategy,
    ],
})
export class AppModule {
  
  static port: number | string;

  constructor() {
    AppModule.port = process.env.PORT;
  }
}
