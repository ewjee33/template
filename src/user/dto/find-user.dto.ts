import { IsString, IsEmail, IsOptional } from 'class-validator';

export class FindUserDto {
  @IsString()
  @IsOptional()
  readonly username?: string;

  @IsEmail()
  @IsOptional()
  readonly email?: string;
}