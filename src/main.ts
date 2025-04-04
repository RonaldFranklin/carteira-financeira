import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
  const config = new DocumentBuilder()
    .setTitle('API Carteira Financeira')
    .setDescription('Documentação da API de um sistema bancário fictício')
    .setVersion('1.0')
    .addBearerAuth() // habilita autenticação via JWT no Swagger
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
}
bootstrap();
