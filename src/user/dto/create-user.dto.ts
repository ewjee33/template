import { IsString, MinLength, IsEmail, IsBoolean, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(3)
  readonly userId!: string;

  @IsEmail()
  readonly email!: string;

  @IsString()
  @MinLength(8)
  readonly password!: string;

  @IsString()
  readonly consumerId!: string;

  @IsString()
  readonly keyId!: string;

  @IsBoolean()
  @IsOptional()
  readonly isCheater?: boolean;

  @IsBoolean()
  @IsOptional()
  readonly deleted?: boolean;
}