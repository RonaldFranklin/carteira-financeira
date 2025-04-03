import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Injectable()
export class TransactionService {
  private readonly logger = new Logger(TransactionService.name);

  constructor(private prisma: PrismaService) {}

  // Debits the sender's account, credits the receiver's account and records the transaction for potential reversal
  async createTransaction(createTransactionDto: CreateTransactionDto) {
    const { senderAccountId, receiverAccountId, amount } = createTransactionDto;

    // Verify sender account exists and has sufficient balance
    const senderAccount = await this.prisma.account.findUnique({
      where: { id: senderAccountId },
    });
    if (!senderAccount) {
      throw new NotFoundException('Sender account not found');
    }
    if (senderAccount.balance < amount) {
      throw new BadRequestException('Insufficient balance in sender account');
    }

    // Verify receiver account exists
    const receiverAccount = await this.prisma.account.findUnique({
      where: { id: receiverAccountId },
    });
    if (!receiverAccount) {
      throw new NotFoundException('Receiver account not found');
    }

    // Execute the transaction atomically
    const transaction = await this.prisma.$transaction(async (tx) => {
      await tx.account.update({
        where: { id: senderAccountId },
        data: { balance: { decrement: amount } },
      });

      await tx.account.update({
        where: { id: receiverAccountId },
        data: { balance: { increment: amount } },
      });

      // Record the transaction with status "SUCCESS"
      return tx.transaction.create({
        data: {
          amount,
          status: 'SUCCESS',
          senderAccountId,
          receiverAccountId,
        },
      });
    });
    this.logger.log(`Transaction created successfully: ID ${transaction.id}`);
    return transaction;
  }

  // Lists all transactions involving a specific account
  async listTransactionsByAccount(accountId: number) {
    return this.prisma.transaction.findMany({
      where: {
        OR: [
          { senderAccountId: accountId },
          { receiverAccountId: accountId }
        ]
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  // Reverses a transaction, returning the amount to the sender's account
  async reverseTransaction(transactionId: number) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
    });
    if (!transaction) {
      throw new NotFoundException("Transaction not found");
    }
    if (transaction.status !== 'SUCCESS') {
      throw new BadRequestException("Only successful transactions can be reversed");
    }

    const senderAccount = await this.prisma.account.findUnique({
      where: { id: transaction.senderAccountId },
    });
    const receiverAccount = await this.prisma.account.findUnique({
      where: { id: transaction.receiverAccountId },
    });
    if (!senderAccount || !receiverAccount) {
      throw new NotFoundException("Account not found");
    }
    // Verify receiver account has sufficient balance for reversal
    if (receiverAccount.balance < transaction.amount) {
      throw new BadRequestException("Receiver account does not have sufficient balance for reversal");
    }

    const reversedTransaction = await this.prisma.$transaction(async (tx) => {
      // Reverse the debit and credit
      await tx.account.update({
        where: { id: senderAccount.id },
        data: { balance: { increment: transaction.amount } },
      });
      await tx.account.update({
        where: { id: receiverAccount.id },
        data: { balance: { decrement: transaction.amount } },
      });
      // Update the transaction status to "CANCELLED"
      return tx.transaction.update({
        where: { id: transaction.id },
        data: { status: 'CANCELLED' },
      });
    });

    this.logger.log(`Transaction reversed successfully: ID ${reversedTransaction.id}`);
    return reversedTransaction;
  }

  // Returns a specific transaction for a user
  async getTransactionForUser(transactionId: number, userId: number) {
    // Get the user's account
    const account = await this.prisma.account.findUnique({
      where: { userId },
    });
    if (!account) {
      throw new NotFoundException("User account not found");
    }

    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
    });
    if (!transaction) {
      throw new NotFoundException("Transaction not found");
    }
    // Check if the user's account is involved in the transaction
    if (transaction.senderAccountId !== account.id && transaction.receiverAccountId !== account.id) {
      throw new BadRequestException("This transaction is not associated with the user's account");
    }
    return transaction;
  }
}
