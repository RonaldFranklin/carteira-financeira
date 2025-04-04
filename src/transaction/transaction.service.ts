import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Injectable()
export class TransactionService {
  private readonly logger = new Logger(TransactionService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Cria uma nova transação entre duas contas, valida saldo e existencia das contas.
   * @param createTransactionDto - Dados da transação (IDs das contas e valor)
   * @returns Objeto da transação criada
   * @throws BadRequestException | NotFoundException - Erros de validação ou saldo
  */
  async createTransaction(createTransactionDto: CreateTransactionDto) {
    const { senderAccountId, receiverAccountId, amount } = createTransactionDto;

    this.logger.log(`Initiating transaction: sender=${senderAccountId}, receiver=${receiverAccountId}, amount=${amount}`);

    const senderAccount = await this.prisma.account.findUnique({
      where: { id: senderAccountId },
    });

    if (!senderAccount) {
      this.logger.warn(`Sender account not found: ${senderAccountId}`);
      throw new NotFoundException('Sender account not found');
    }

    if (senderAccount.balance < amount) {
      this.logger.warn(`Insufficient balance in sender account ID ${senderAccountId}`);
      throw new BadRequestException('Insufficient balance in sender account');
    }

    const receiverAccount = await this.prisma.account.findUnique({
      where: { id: receiverAccountId },
    });

    if (!receiverAccount) {
      this.logger.warn(`Receiver account not found: ${receiverAccountId}`);
      throw new NotFoundException('Receiver account not found');
    }

    const transaction = await this.prisma.$transaction(async (tx) => {
      await tx.account.update({
        where: { id: senderAccountId },
        data: { balance: { decrement: amount } },
      });

      await tx.account.update({
        where: { id: receiverAccountId },
        data: { balance: { increment: amount } },
      });

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

  /**
   * Lista todas as transações associadas a uma conta.
   * @param accountId - ID da conta
   * @returns Lista de transações ordenadas por data
  */
  async listTransactionsByAccount(accountId: number) {
    this.logger.log(`Listing transactions for account ID: ${accountId}`);

    return this.prisma.transaction.findMany({
      where: {
        OR: [
          { senderAccountId: accountId },
          { receiverAccountId: accountId },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Reverte uma transação existente (troca o saldo e atualiza o status).
   * @param transactionId - ID da transação a ser revertida
   * @returns Objeto da transação com status atualizado
   * @throws NotFoundException | BadRequestException - Validações de integridade
  */
  async reverseTransaction(transactionId: number) {
    this.logger.log(`Attempting to reverse transaction ID: ${transactionId}`);

    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) {
      this.logger.warn(`Transaction not found: ${transactionId}`);
      throw new NotFoundException("Transaction not found");
    }

    if (transaction.status !== 'SUCCESS') {
      this.logger.warn(`Transaction ${transactionId} is not reversible (status: ${transaction.status})`);
      throw new BadRequestException("Only successful transactions can be reversed");
    }

    const senderAccount = await this.prisma.account.findUnique({
      where: { id: transaction.senderAccountId },
    });

    const receiverAccount = await this.prisma.account.findUnique({
      where: { id: transaction.receiverAccountId },
    });

    if (!senderAccount || !receiverAccount) {
      this.logger.warn(`One or both accounts involved in transaction ${transactionId} not found`);
      throw new NotFoundException("Account not found");
    }

    if (receiverAccount.balance < transaction.amount) {
      this.logger.warn(`Receiver account ${receiverAccount.id} has insufficient balance for reversal`);
      throw new BadRequestException("Receiver account does not have sufficient balance for reversal");
    }

    const reversedTransaction = await this.prisma.$transaction(async (tx) => {
      await tx.account.update({
        where: { id: senderAccount.id },
        data: { balance: { increment: transaction.amount } },
      });

      await tx.account.update({
        where: { id: receiverAccount.id },
        data: { balance: { decrement: transaction.amount } },
      });

      return tx.transaction.update({
        where: { id: transaction.id },
        data: { status: 'CANCELLED' },
      });
    });

    this.logger.log(`Transaction reversed successfully: ID ${reversedTransaction.id}`);
    return reversedTransaction;
  }

  /**
   * Retorna uma transação específica de um usuário.
   * @param transactionId - ID da transação
   * @param userId - ID do usuário
   * @returns Objeto da transação
   * @throws NotFoundException | BadRequestException - Se não for vinculada ao usuário
  */
  async getTransactionForUser(transactionId: number, userId: number) {
    this.logger.log(`Fetching transaction ${transactionId} for user ${userId}`);

    const account = await this.prisma.account.findUnique({
      where: { userId },
    });

    if (!account) {
      this.logger.warn(`Account not found for user ${userId}`);
      throw new NotFoundException("User account not found");
    }

    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) {
      this.logger.warn(`Transaction not found: ${transactionId}`);
      throw new NotFoundException("Transaction not found");
    }

    if (
      transaction.senderAccountId !== account.id &&
      transaction.receiverAccountId !== account.id
    ) {
      this.logger.warn(`Transaction ${transactionId} not associated with user ${userId}`);
      throw new BadRequestException("This transaction is not associated with the user's account");
    }

    this.logger.log(`Transaction ${transactionId} successfully fetched for user ${userId}`);
    return transaction;
  }

  /**
   * Deleta todas as transações relacionadas ao usuário informado.
   * @param userId - ID do usuário
   * @returns void
  */
  async deleteAllUserTransactions(userId: number) {
    this.logger.log(`Deleting all transactions for user ID: ${userId}`);

    const account = await this.prisma.account.findUnique({
      where: { userId },
    });

    if (!account) {
      this.logger.warn(`No account found for user ID: ${userId}, skipping transaction deletion`);
      return;
    }

    const deleted = await this.prisma.transaction.deleteMany({
      where: {
        OR: [
          { senderAccountId: account.id },
          { receiverAccountId: account.id },
        ],
      },
    });

    this.logger.log(`Deleted ${deleted.count} transactions for user ${userId}`);
  }
}
