import { IsMongoId } from 'class-validator';

export class FindByIdDto {
  @IsMongoId({ message: 'ID must be a valid MongoDB ObjectId' })
  id!: string;
}