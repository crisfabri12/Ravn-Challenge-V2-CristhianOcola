import { Module } from '@nestjs/common';
import { databaseProviders } from './database.service';
import { ConfigService } from '../config/config.service';

@Module({
  imports: [...databaseProviders, ConfigService],
  exports: [...databaseProviders],
})
export class DatabaseModule {}
