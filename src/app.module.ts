import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserController } from './user/user.controller';
import { UserModule } from './user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Logger } from './utils/logger';
import { ConfigModule , ConfigService} from '@nestjs/config';
import { ResponseLoggingMiddleware } from './middleware/responseLogginMiddleware';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-store';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), 
    UserModule , 
    MongooseModule.forRoot(process.env.DB_URL ?? "DB URL"), 
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        store: await redisStore({
          host: configService.get<string>('REDIS_HOST'),
          port: configService.get<number>('REDIS_PORT'),
          ttl: configService.get<number>('REDIS_TTL'), // Cache TTL in seconds
        }),
      }),
      inject: [ConfigService],
      isGlobal: true, // Makes CacheModule available globally
    })],
  controllers: [AppController, UserController],
  providers: [ResponseLoggingMiddleware, AppService, Logger],
})
export class AppModule {}

