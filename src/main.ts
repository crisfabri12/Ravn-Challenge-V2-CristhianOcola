import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';
async function bootstrap() {
  const app = await NestFactory.create(AppModule).then(
    async (nestApplication) => {
      //
      // Create two test users (client, manager) when the application start if it doesn't exist
      // TODO: Check the environment to only run when running locally or development mode
      //
      const prisma = nestApplication.get(PrismaService);

      return nestApplication;
    },
  );

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
