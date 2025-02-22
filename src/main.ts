import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ResponseLoggingMiddleware } from './middleware/responseLogginMIddleware';
import { AllExceptionsFilter } from './middleware/allExceptionsFilter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, 
    transform: true, 
    transformOptions: {
      enableImplicitConversion: true, // Automatically convert types
    },
  }));
  app.use(ResponseLoggingMiddleware);
  app.useGlobalFilters(new AllExceptionsFilter());
  await app.listen(Number(process.env.PORTNUMBER));
}
bootstrap();
