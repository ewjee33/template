import { Injectable } from '@nestjs/common';
import { BaseService } from '../base/base.service';
import { UserDocument } from './user.schema';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
@Injectable()
export class UserService extends BaseService<UserDocument, CreateUserDto> {
  constructor(@InjectModel("User") private userModel: Model<UserDocument>) {
    super(userModel);
  }
  static get modelName(): string {
    return 'User';
  }
}