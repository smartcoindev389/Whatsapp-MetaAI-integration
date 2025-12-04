import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for frontend
  app.enableCors({
    origin: process.env.VITE_API_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Verify database connection
  const prismaService = app.get(PrismaService);
  try {
    const isHealthy = await prismaService.isHealthy();
    if (isHealthy) {
      logger.log('✓ Database connection verified');
    } else {
      logger.warn('⚠ Database connection check failed');
    }
  } catch (error) {
    logger.error('✗ Database connection error:', error.message);
    logger.warn('Application will continue, but database operations may fail');
  }

  const port = process.env.APP_PORT || 3000;
  await app.listen(port);
  logger.log(`Application is running on: http://localhost:${port}`);
  logger.log(`Health check available at: http://localhost:${port}/health`);
}
bootstrap();

