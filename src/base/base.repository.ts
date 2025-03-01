// base.repository.ts
import { Injectable } from '@nestjs/common';
import { Model, UpdateQuery, ClientSession } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Injectable()
export abstract class BaseRepository<T extends Document, DTO> {
  constructor(
    @InjectModel((this! as typeof BaseRepository).modelName)
    protected readonly model: Model<T>
  ) {}

  static get modelName(): string {
    throw new Error(`Model name not implemented for ${this.name}`);
  }

  async create(dto: DTO, session: ClientSession | null = null): Promise<T> {
    try {
      const newEntity = new this.model(dto);
      return await newEntity.save({ session }); // session is now ClientSession | null
    } catch (error) {
      console.error(`Error creating entity:`, error);
      throw new Error('Failed to create entity');
    }
  }

  async findOne(id: string | number, session: ClientSession | null = null): Promise<T | null> {
    try {
      return await this.model.findById(id).session(session).exec(); // session is ClientSession | null
    } catch (error) {
      console.error(`Error finding entity:`, error);
      throw new Error('Failed to find entity');
    }
  }

  async update(id: string | number, dto: Partial<DTO>, session: ClientSession | null = null): Promise<T> {
    try {
      const updatedEntity = await this.model
        .findByIdAndUpdate(id, dto as UpdateQuery<T>, { new: true, session }) // session is ClientSession | null
        .exec();
      if (!updatedEntity) {
        throw new Error('Entity not found');
      }
      return updatedEntity;
    } catch (error) {
      console.error(`Error updating entity:`, error);
      throw new Error('Failed to update entity');
    }
  }
}