import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class AccountService {
  private readonly logger = new Logger(AccountService.name);

  constructor(private prisma: PrismaService) {}

  // Retrieves the account associated with a user
  async getAccountByUserId(userId: number) {
    const account = await this.prisma.account.findUnique({
      where: { userId },
    });
    if (!account) {
      throw new NotFoundException(`Account for user ${userId} not found`);
    }
    return account;
  }

  // Deposit: increases the account balance
  async deposit(userId: number, amount: number) {
    if (amount <= 0) {
      throw new BadRequestException('Deposit amount must be positive');
    }
    const account = await this.getAccountByUserId(userId);
    const updatedAccount = await this.prisma.account.update({
      where: { id: account.id },
      data: {
        balance: { increment: amount },
      },
    });
    this.logger.log(`Deposit of ${amount} for user ${userId} successful. New balance: ${updatedAccount.balance}`);
    return updatedAccount;
  }

  // Withdrawal: decreases the account balance, if sufficient funds exist
  async withdraw(userId: number, amount: number) {
    if (amount <= 0) {
      throw new BadRequestException('Withdrawal amount must be positive');
    }
    const account = await this.getAccountByUserId(userId);
    if (account.balance < amount) {
      throw new BadRequestException('Insufficient balance for withdrawal');
    }
    const updatedAccount = await this.prisma.account.update({
      where: { id: account.id },
      data: {
        balance: { decrement: amount },
      },
    });
    this.logger.log(`Withdrawal of ${amount} for user ${userId} successful. New balance: ${updatedAccount.balance}`);
    return updatedAccount;
  }
}
