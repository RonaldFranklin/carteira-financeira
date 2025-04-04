import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'example@example.com' })
  email: string;

  @ApiProperty({ example: 'example' })
  name: string;

  @ApiProperty({ example: 'example123', minLength: 6 })
  password: string;
}
