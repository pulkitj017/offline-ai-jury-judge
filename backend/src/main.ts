import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from './logging/logger.config';
import * as fs from 'fs';
import { join } from 'path';

async function bootstrap() {
  // Create logs directory if it doesn't exist
  const logsDir = join(process.cwd(), 'logs');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
  }

  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(winstonConfig),
  });
  
  // Enable CORS for the frontend
  app.enableCors({
    origin: '*', // Allow all origins temporarily for debugging
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });
  
  // Enable validation
  app.useGlobalPipes(new ValidationPipe());
  
  await app.listen(3001);
  console.log('AI Jury backend running on http://localhost:3001');
}
bootstrap();
