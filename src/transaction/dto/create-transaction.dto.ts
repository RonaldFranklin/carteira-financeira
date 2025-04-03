import { IsNumber, IsPositive } from 'class-validator';

export class CreateTransactionDto {
  @IsNumber()
  senderAccountId: number;

  @IsNumber()
  receiverAccountId: number;

  @IsNumber()
  @IsPositive()
  amount: number;
}
