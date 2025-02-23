import { Injectable, ConflictException, Logger } from '@nestjs/common';

// Generic type T for entity flexibility (not tied to Mongoose Document)
@Injectable()
export abstract class BaseService<T> {
  protected readonly logger = new Logger(this.constructor.name);

  // Validate an entity exists, throwing an exception if not
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

  // Log an operation (could be extended to a logging service)
  protected logOperation(operation: string, details?: any): void {
    this.logger.log(`${operation} executed`, details);
  }
}