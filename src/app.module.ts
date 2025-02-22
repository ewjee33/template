import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserController } from './user/user.controller';
import { UserModule } from './user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Logger } from './utils/logger';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), 
    UserModule , 
    MongooseModule.forRoot(process.env.DB_URL ?? "DB URL"), ],
  controllers: [AppController, UserController],
  providers: [AppService, Logger],
  
})
export class AppModule {}

