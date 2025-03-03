import { IsString, IsEmail, IsOptional , IsMongoId} from 'class-validator';

export class FindUserDto {
  @IsString()
  @IsOptional()
  readonly id?: string;

  @IsEmail()
  @IsOptional()
  readonly email?: string;
}