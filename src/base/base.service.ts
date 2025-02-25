// base.service.ts
import { Injectable, ConflictException, Logger } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import { Document, ClientSession } from 'mongoose';

@Injectable()
export abstract class BaseService<T extends Document, DTO> {
  protected readonly logger = new Logger(this.constructor.name);

  protected abstract get repository(): BaseRepository<T, DTO>;

  async create(createDto: DTO, session: ClientSession | null = null): Promise<T> {
    this.logOperation('Creating entity', createDto);
    return this.wrapAsyncOperation(
      async () => {
        const entity = await this.repository.create(createDto, session);
        this.ensureExists(entity, 'Entity');
        return entity;
      },
      'Failed to create entity'
    );
  }

  async findOne(id: string | number, session: ClientSession | null = null): Promise<T> {
    return this.wrapAsyncOperation(
      async () => {
        const entity = await this.repository.findOne(id, session);
        return this.ensureExists(entity, 'Entity');
      },
      'Failed to find entity'
    );
  }

  async update(id: string | number, dto: Partial<DTO>, session: ClientSession | null = null): Promise<T> {
    return this.wrapAsyncOperation(
      async () => {
        const entity = await this.repository.update(id, dto, session);
        this.ensureExists(entity, 'Entity');
        return entity;
      },
      'Failed to update entity'
    );
  }

  protected ensureExists(entity: T | null, entityName: string): T {
    if (!entity) {
      throw new ConflictException(`${entityName} not found`);
    }
    return entity;
  }

  protected validate(condition: boolean, errorMessage: string): void {
    if (!condition) {
      throw new ConflictException(errorMessage);
    }
  }

  protected logOperation(operation: string, details?: any): void {
    this.logger.log(`${operation} executed`, details);
  }

  protected async wrapAsyncOperation<R>(
    operation: () => Promise<R>,
    errorMessage: string
  ): Promise<R> {
    try {
      return await operation();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      throw new ConflictException(`${errorMessage}: ${errorMsg}`);
    }
  }
}