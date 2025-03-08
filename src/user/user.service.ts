import { Injectable , CACHE_MANAGER , Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { BaseService } from '../base/base.service';
import { UserDocument } from './user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRepository } from './user.repository';
@Injectable()
export class UserService extends BaseService<UserDocument , CreateUserDto> {
  constructor(
    @Inject(CACHE_MANAGER) protected readonly cacheManager: Cache,
    private readonly userRepository: UserRepository , 
  ) {
    super(cacheManager , 'user');
  }

  protected get repository(): UserRepository {
    return this.userRepository;
  }

  static get modelName(): string {
    return 'User';
  }
}