import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ResponseLoggingMiddleware } from './middleware/responseLogginMiddleware';
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
  const responseLoggingMiddleware = app.get(ResponseLoggingMiddleware);
  app.use(responseLoggingMiddleware.use.bind(responseLoggingMiddleware));
  //app.useGlobalFilters(new AllExceptionsFilter());
  await app.listen(Number(process.env.PORTNUMBER) || 3000);
}
bootstrap();
