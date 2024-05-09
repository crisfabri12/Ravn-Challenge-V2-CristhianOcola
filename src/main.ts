import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const prisma = app.get(PrismaService);
  await prisma.cleanDb();
  await prisma.seedUsers();
  await prisma.seedCategory();
  await prisma.seedBooks(); 
  
  app.setGlobalPrefix('api');
  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('VapeStore')
    .setDescription('VapeStore')
    .setVersion('1.0')
    .addTag('VapeStore RAVN')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(AppModule.port);
}

bootstrap();
