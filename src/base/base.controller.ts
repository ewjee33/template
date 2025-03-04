import { Body, Controller, Param, ParseIntPipe, Get , Post, Put, UseInterceptors , HttpException, HttpStatus, UseFilters} from '@nestjs/common';
import { ClassSerializerInterceptor } from '@nestjs/common';
import { AllExceptionsFilter } from 'src/middleware/allExceptionsFilter';
import { FindByIdDto } from 'src/base/dto/findEntityById.dto';

@Controller()
@UseFilters(AllExceptionsFilter)
export abstract class BaseController<T , DTO> {
  protected constructor(
    protected readonly service: any
  ) {}

  protected logError(methodName: string, error: any) {
    console.error(`Error in [${this.constructor.name}].[${methodName}]:`, error);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get(':id')
  async findOne(@Param() params: FindByIdDto): Promise<T> {
    try {
        return await this.service.findOne(params.id);
    } catch(error) {
        this.logError('findOne', error);
        throw error;
    }
  }

  @Post()
  async create(@Body() dto: DTO): Promise<T> {
    try { 
        return await this.service.create(dto);
    } catch(error) {
        this.logError('create', error);
        throw error;
    }
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: Partial<DTO>): Promise<T>{
    try {
        return this.service.update(id, dto);
    } catch(error) {
        this.logError('update', error);
        throw error;
    }
  }

  // Add more common CRUD methods if they apply to all controllers
}