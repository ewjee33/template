import { Controller, Post, Get , Put , Body, Param , ParseIntPipe } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UserService } from './user.service';
import { BaseController } from 'src/base/base.controller';
import { User } from './user.schema';

// Usage in a concrete controller
@Controller('users')
export class UserController extends BaseController<User, CreateUserDto> {
  constructor(private readonly userService: UserService) {
    super(userService);
  }
  // Additional methods or overrides if needed
}