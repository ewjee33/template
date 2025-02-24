// base.service.ts
import { Injectable, ConflictException, Logger } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import { Document } from 'mongoose';

@Injectable()
export abstract class BaseService<T extends Document, DTO> {
  protected readonly logger = new Logger(this.constructor.name);

  // Abstract getter for the repository
  protected abstract get repository(): BaseRepository<T, DTO>;

  // Create method using the repository
  async create(createDto: DTO): Promise<T> {
    this.logOperation('Creating entity', createDto);

    return this.wrapAsyncOperation(
      async () => {
        const entity = await this.repository.create(createDto);
        this.ensureExists(entity, 'Entity');
        return entity;
      },
      'Failed to create entity'
    );
  }

  // Find one entity by ID
  async findOne(id: string | number): Promise<T | null> {
    return this.wrapAsyncOperation(
      async () => {
        const entity = await this.repository.findOne(id);
        this.ensureExists(entity, 'Entity');
        return entity;
      },
      'Failed to find entity'
    );
  }

  // Update entity
  async update(id: string | number, dto: Partial<DTO>): Promise<T> {
    return this.wrapAsyncOperation(
      async () => {
        const entity = await this.repository.update(id, dto);
        this.ensureExists(entity, 'Entity');
        return entity;
      },
      'Failed to update entity'
    );
  }

  // Validate an entity exists
  protected ensureExists(entity: T | null, entityName: string): T {
    if (!entity) {
      throw new ConflictException(`${entityName} not found`);
    }
    return entity;
  }

  // Generic validation wrapper
  protected validate(condition: boolean, errorMessage: string): void {
    if (!condition) {
      throw new ConflictException(errorMessage);
    }
  }

  // Log an operation
  protected logOperation(operation: string, details?: any): void {
    this.logger.log(`${operation} executed`, details);
  }

  // Handle async operations with error wrapping
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