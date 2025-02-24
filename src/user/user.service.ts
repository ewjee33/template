import { Injectable } from '@nestjs/common';
import { BaseService } from '../base/base.service';
import { UserDocument } from './user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRepository } from './user.repository';
@Injectable()
export class UserService extends BaseService<UserDocument , CreateUserDto> {
  constructor(private readonly userRepository: UserRepository) {
    super();
  }

  protected get repository(): UserRepository {
    return this.userRepository;
  }
  
  static get modelName(): string {
    return 'User';
  }
}