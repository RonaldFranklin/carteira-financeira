import { IsEmail, IsOptional, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({ example: 'example@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: 'example' })
  @IsOptional()
  @IsNotEmpty()
  name?: string;

  @ApiProperty({ example: 'example123', minLength: 6 })
  @IsOptional()
  @MinLength(6)
  password?: string;
}
