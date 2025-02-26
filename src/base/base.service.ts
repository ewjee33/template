// base.service.ts
import { Injectable, Inject , ConflictException, Logger } from '@nestjs/common';
import { CACHE_MANAGER , Cache } from '@nestjs/cache-manager';
import { BaseRepository } from './base.repository';
import { Document, ClientSession } from 'mongoose';

@Injectable()
export abstract class BaseService<T extends Document, DTO> {
  protected readonly logger = new Logger(this.constructor.name);
  constructor(
    @Inject(CACHE_MANAGER) protected readonly cacheManager: Cache,
    private readonly entityName: string,) {}
  
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
        // 1. Define a cache key specific to the ID
        const cacheKey = `${this.entityName}:${id}`;

        // 2. Check Redis for cached result
        const cachedResult = await this.cacheManager.get<string>(cacheKey);
        if (cachedResult) {
          return JSON.parse(cachedResult); // Return cached entity
        }

        // 3. If not in cache, query the database
        const entity = await this.repository.findOne(id, session);

        // 4. Ensure entity exists (your existing logic)
        const result = this.ensureExists(entity, 'Entity');

        // 5. Cache the result after successful query
        await this.cacheManager.set(cacheKey, JSON.stringify(result),  3600 );

        return result;
      },
      'Failed to find entity'
    );
  }

  async update(id: string | number, updateDto: Partial<DTO>, session: ClientSession | null = null): Promise<T> {
    return this.wrapAsyncOperation(
      async () => {
        // 1. Update the entity via the repository
        const updatedEntity = await this.repository.update(id, updateDto, session);
        this.ensureExists(updatedEntity, 'Entity');

        // 2. Invalidate the cache for this entity
        const cacheKey = `${this.entityName}:${id}`; // e.g., "user:123"
        await this.cacheManager.del(cacheKey);

        return updatedEntity;
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