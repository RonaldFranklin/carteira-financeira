import { IsEmail, IsOptional, IsNotEmpty, MinLength } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @MinLength(6)
  password?: string;
}
