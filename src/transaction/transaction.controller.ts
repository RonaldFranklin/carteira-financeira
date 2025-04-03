import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('transaction')
@UseGuards(AuthGuard('jwt'))
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  // Performs a transfer between accounts and records the transaction details
  @Post()
  async createTransaction(@Body() createTransactionDto: CreateTransactionDto) {
    return this.transactionService.createTransaction(createTransactionDto);
  }

  // Lists all transactions involving a specific account
  @Get('account/:accountId')
  async listTransactionsByAccount(@Param('accountId') accountId: string) {
    return this.transactionService.listTransactionsByAccount(Number(accountId));
  }

  // Reverses a transaction, returning the amount to the sender's account
  @Post('reverse/:transactionId')
  async reverseTransaction(@Param('transactionId') transactionId: string) {
    return this.transactionService.reverseTransaction(Number(transactionId));
  }

  // Returns a specific transaction for a user
  @Get(':transactionId/user/:userId')
  async getTransactionForUser(
    @Param('transactionId') transactionId: string,
    @Param('userId') userId: string,
  ) {
    return this.transactionService.getTransactionForUser(Number(transactionId), Number(userId));
  }
}
