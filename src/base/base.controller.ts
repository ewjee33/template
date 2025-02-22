import { Body, Controller, Param, ParseIntPipe, Post, Put, UseInterceptors , HttpException, HttpStatus} from '@nestjs/common';
import { ClassSerializerInterceptor } from '@nestjs/common';

@Controller()
export abstract class BaseController<T , DTO> {
  protected constructor(
    // Assuming you have a way to inject the service
    protected readonly service: any
  ) {}

  protected logError(methodName: string, error: any) {
    console.error(`Error in [${this.constructor.name}].[${methodName}]:`, error);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<T> {
    try {
        return await this.service.findOne(id);
    } catch(error) {
        this.logError('findOne', error);
        throw new HttpException('Failed to find user', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post()
  async create(@Body() dto: DTO): Promise<T> {
    try { 
        return await this.service.create(dto);
    } catch(error) {
        this.logError('create', error);
        throw new HttpException('Failed to create user', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: Partial<DTO>): Promise<T>{
    try {
        return this.service.updateUser(id, dto);
    } catch(error) {
        this.logError('update', error);
        throw new HttpException('Failed to update user', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Add more common CRUD methods if they apply to all controllers
}