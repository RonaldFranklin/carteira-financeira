import { IsNumber, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateAccountDto {
  @ApiProperty({ example: 100, description: 'Valor a ser depositado ou sacado'})
  @IsNumber()
  @IsPositive()
  amount: number;
}
