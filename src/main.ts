import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  dotenv.config();
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('Digital Shop API')
    .setDescription('Documentación de la API de Digital Shop')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('doc', app, document);

   const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');

  console.info(`🚀 Servidor corriendo correctamente`);
  console.info(`📚 Documentación Swagger disponible en /doc`);
}
bootstrap();
