import { TypeOrmModule } from '@nestjs/typeorm';
import { configService } from '../config/config.service';

export const typeormconfig = {};

export const databaseProviders = [
  TypeOrmModule.forRoot(configService.getTypeOrmConfig()),
];
