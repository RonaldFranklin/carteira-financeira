import { IsNumber, IsPositive } from 'class-validator';

export class UpdateAccountDto {
  @IsNumber()
  @IsPositive()
  amount: number;
}
