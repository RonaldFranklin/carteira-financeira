import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class AccountService {
  private readonly logger = new Logger(AccountService.name);

  constructor(private prisma: PrismaService) {}

  async getAccountByNumber(accountNumber: string) {
    const account = await this.prisma.account.findUnique({
      where: { number: accountNumber },
    });

    if (!account) {
      throw new NotFoundException(`Account with number ${accountNumber} not found`);
    }

    return account;
  }

  async deposit(accountNumber: string, amount: number) {
    if (amount <= 0) {
      throw new BadRequestException('Deposit amount must be positive');
    }

    const account = await this.getAccountByNumber(accountNumber);

    const updatedAccount = await this.prisma.account.update({
      where: { id: account.id },
      data: {
        balance: { increment: amount },
      },
    });

    this.logger.log(
      `Deposit of ${amount} to account ${accountNumber} successful. New balance: ${updatedAccount.balance}`,
    );

    return updatedAccount;
  }

  async withdraw(accountNumber: string, amount: number) {
    if (amount <= 0) {
      throw new BadRequestException('Withdrawal amount must be positive');
    }

    const account = await this.getAccountByNumber(accountNumber);

    if (account.balance < amount) {
      throw new BadRequestException('Insufficient balance for withdrawal');
    }

    const updatedAccount = await this.prisma.account.update({
      where: { id: account.id },
      data: {
        balance: { decrement: amount },
      },
    });

    this.logger.log(
      `Withdrawal of ${amount} from account ${accountNumber} successful. New balance: ${updatedAccount.balance}`,
    );

    return updatedAccount;
  }

  async deleteAccountByUserId(userId: number) {
    await this.prisma.account.deleteMany({ where: { userId } });
    this.logger.log(`Account for user ${userId} deleted`);
  }
}

