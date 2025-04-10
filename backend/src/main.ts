
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for the frontend
  app.enableCors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  });
  
  // Enable validation
  app.useGlobalPipes(new ValidationPipe());
  
  await app.listen(3001);
  console.log('AI Jury backend running on http://localhost:3001');
}
bootstrap();
