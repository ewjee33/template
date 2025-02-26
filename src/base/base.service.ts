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
        const cacheKey = `${this.entityName}:${id}`;
        const lockKey = `${cacheKey}:lock`;

        // 1. Check cache first
        let cachedResult: string | null;
        try {
          cachedResult = await this.cacheManager.get<string>(cacheKey);
          if (cachedResult) {
            return JSON.parse(cachedResult);
          }
        } catch (error: unknown) {
          this.logger.warn(`Cache get failed: ${(error instanceof Error ? error.message : String(error))}`);
        }

        // 2. Try to acquire a lock
        let acquiredLock: boolean = false;
        try {
          // Type assertion for nx option; returns true if set, false if key existed
          const lockSet = await this.cacheManager.set(lockKey, '1', 10);
          acquiredLock = lockSet !== undefined && lockSet !== null; // Handle Redis-specific return
        } catch (error: unknown) {
          this.logger.warn(`Lock acquisition failed: ${(error instanceof Error ? error.message : String(error))}`);
        }

        if (acquiredLock) {
          try {
            // 3. Lock acquired: query DB and set cache
            const entity = await this.repository.findOne(id, session);
            this.ensureExists(entity, this.entityName);
            try {
              await this.cacheManager.set(cacheKey, JSON.stringify(entity), 3600);
            } catch (error: unknown) {
              this.logger.warn(`Cache set failed: ${(error instanceof Error ? error.message : String(error))}`);
            }
            return entity;
          } finally {
            // 4. Release the lock
            try {
              await this.cacheManager.del(lockKey);
            } catch (error: unknown) {
              this.logger.warn(`Lock release failed: ${(error instanceof Error ? error.message : String(error))}`);
            }
          }
        } else {
          // 5. Lock not acquired: wait and retry
          await new Promise(resolve => setTimeout(resolve, 100));
          return this.findOne(id, session); // Recursive retry
        }
      },
      `Failed to find ${this.entityName.toLowerCase()}`
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