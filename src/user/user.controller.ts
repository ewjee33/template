import { Controller, Post, Body , HttpException, HttpStatus} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UserService } from './user.service';
import { BaseController } from 'src/base/base.controller';
import { User } from './user.schema';
import mongoose from 'mongoose';

// Usage in a concrete controller
@Controller('users')
export class UserController extends BaseController<User, CreateUserDto> {
  constructor(private readonly userService: UserService) {
    super(userService);
  }
  // Additional methods or overrides if needed
  @Post('transactional')
  async createTransactional(@Body() createDto: CreateUserDto): Promise<User> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const user = await this.service.wrapAsyncOperation(
        async () => {
          const createdUser = await this.service.create(createDto, session);
          // Simulate an external async call (e.g., logging to a third-party service)
          await new Promise((resolve) => setTimeout(resolve, 100)); // Mock delay
          return createdUser;
        },
        'Failed to create user transactionally'
      );
      await session.commitTransaction();
      return user;
    } catch (error) {
      await session.abortTransaction();
      this.logError('createTransactional', error);
      throw new HttpException('Failed to create user', HttpStatus.INTERNAL_SERVER_ERROR);
    } finally {
      session.endSession();
    }
  }

}