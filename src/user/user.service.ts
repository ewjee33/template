import { Injectable , Inject} from '@nestjs/common';
import { CACHE_MANAGER , Cache } from '@nestjs/cache-manager';
import { BaseService } from '../base/base.service';
import { UserDocument } from './user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRepository } from './user.repository';
@Injectable()
export class UserService extends BaseService<UserDocument , CreateUserDto> {
  constructor(private readonly userRepository: UserRepository , 
    @Inject(CACHE_MANAGER) cacheManager: Cache) {
    super(cacheManager);
  }

  protected get repository(): UserRepository {
    return this.userRepository;
  }

  static get modelName(): string {
    return 'User';
  }
}