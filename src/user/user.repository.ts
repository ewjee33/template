import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../base/base.Repository';
import { UserDocument } from './user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
@Injectable()
export class UserRepository extends BaseRepository<UserDocument, CreateUserDto> {
  constructor(@InjectModel("User") private userModel: Model<UserDocument>) {
    super(userModel);
  }
  static get modelName(): string {
    return 'User';
  }
}