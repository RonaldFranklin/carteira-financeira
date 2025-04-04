import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Banco API')
    .setDescription('API de gerenciamento de contas, usuários e transações')
    .setVersion('1.0')
    .addBearerAuth() // Adiciona o campo Authorization (Bearer Token)
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); // Documentação disponível em /api

  await app.listen(3000);
}
bootstrap();
