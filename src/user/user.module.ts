import { Module , CacheModule} from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserSchema } from './user.schema';
import { UserRepository } from './user.repository';
import * as redisStore from 'cache-manager-ioredis';
@Module({
  imports: [MongooseModule.forFeature([{name: "User", schema: UserSchema }]),
  CacheModule.register({
    store: redisStore,
    host: process.env.REDISURL,
    port: process.env.REDISPORT,
    ttl: parseInt(<string>process.env.REDISTTL, 10) || 20,
    isGlobal: true
  }),

  ],
  controllers: [UserController],
  providers: [UserService , UserRepository],
  exports: [UserService]
})
export class UserModule {}
