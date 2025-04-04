import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcryptjs';
import { AccountService } from 'src/account/account.service';
import { TransactionService } from 'src/transaction/transaction.service';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private prisma: PrismaService,
    private accountService: AccountService,
    private transactionService: TransactionService,
  ) { }

  private generateUniqueAccountNumber(): string {
    return Math.floor(1000000000 + Math.random() * 9000000000).toString();
  }

  /**
   * Cria um novo usuário e uma conta associada.
   * @param data - Dados para criação do usuário (nome, email e senha)
   * @returns Objeto do usuário criado (sem senha) e conta vinculada
  */
  async createUser(data: CreateUserDto) {
    this.logger.log(`Starting user creation for email: ${data.email}`);

    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      this.logger.warn(`Email already registered: ${data.email}`);
      throw new BadRequestException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: hashedPassword,
      },
    });

    this.logger.log(`User created successfully with ID: ${user.id}`);

    const account = await this.prisma.account.create({
      data: {
        userId: user.id,
        number: this.generateUniqueAccountNumber(),
        balance: 0,
      },
    });

    this.logger.log(`Account created successfully with number: ${account.number}`);

    const { password, ...userWithoutPassword } = user;
    return { ...userWithoutPassword, account };
  }

  /**
   * Busca um usuário pelo e-mail.
   * @param email - Email do usuário
   * @returns Usuário com senha (usado internamente para autenticação)
  */
  async findByEmail(email: string) {
    this.logger.log(`Searching for user by email: ${email}`);

    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      this.logger.warn(`User not found for email: ${email}`);
      throw new BadRequestException('User not found for email');
    }

    return user;
  }

  /**
   * Busca um usuário pelo ID.
   * @param id - ID numérico do usuário
   * @returns Objeto do usuário, ou exceção se não encontrado
  */
  async findById(id: number) {
    this.logger.log(`Searching for user with ID: ${id}`);

    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      this.logger.error(`User with ID ${id} not found`);
      throw new BadRequestException(`User with ID not found`);
    }

    return user;
  }

  /**
   * Busca um usuário pelo número da conta.
   * @param accountNumber - Número da conta do usuário
   * @returns Objeto do usuário (sem senha)
  */
  async findByAccountNumber(accountNumber: string) {
    this.logger.log(`Searching for user by account number: ${accountNumber}`);

    const account = await this.prisma.account.findUnique({
      where: { number: accountNumber },
      include: { user: true },
    });

    if (!account || !account.user) {
      this.logger.warn(`No user found for account number: ${accountNumber}`);
      throw new BadRequestException('User not found for this account number');
    }

    const { password, ...userWithoutPassword } = account.user;
    return userWithoutPassword;
  }

  /**
   * Lista todos os usuários cadastrados no sistema.
   * @returns Array de usuários
  */
  async getAllUsers() {
    this.logger.log('Listing all users');
    return this.prisma.user.findMany();
  }

  /**
   * Atualiza os dados de um usuário com base no número da conta.
   * @param accountNumber - Número da conta do usuário
   * @param updateData - Dados que serão atualizados
   * @returns Usuário atualizado
  */
  async updateUserByAccountNumber(accountNumber: string, updateData: UpdateUserDto) {
    this.logger.log(`Updating user by account number: ${accountNumber}`);

    const account = await this.prisma.account.findUnique({
      where: { number: accountNumber },
    });

    if (!account) {
      throw new BadRequestException('Account not found');
    }

    const userId = account.userId;

    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
      this.logger.verbose(`Password updated for user ${userId}`);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    this.logger.log(`User with ID ${userId} updated successfully`);
    return updatedUser;
  }

  /**
   * Deleta um usuário e todos os seus dados (conta e transações).
   * @param accountNumber - Número da conta do usuário
   * @returns Objeto do usuário deletado
  */
  async deleteUserByAccountNumber(accountNumber: string) {
    this.logger.log(`Deleting user by account number: ${accountNumber}`);

    const account = await this.prisma.account.findUnique({
      where: { number: accountNumber },
    });

    if (!account) {
      throw new BadRequestException('Account not found');
    }

    const userId = account.userId;

    await this.transactionService.deleteAllUserTransactions(userId);
    await this.accountService.deleteAccountByUserId(userId);

    const deletedUser = await this.prisma.user.delete({ where: { id: userId } });
    this.logger.log(`User with ID ${userId} deleted successfully`);

    return deletedUser;
  }


  /**
   * Retorna todas as informações de um usuário a partir do seu e-mail,
   * incluindo os dados da conta associada.
   *
   * @param email - Endereço de e-mail do usuário
   * @returns Objeto do usuário (sem senha) com os dados da conta vinculada
   * @throws BadRequestException - Se o usuário não for encontrado
  */
  async getFullUserInfoByEmail(email: string) {
    this.logger.log(`Fetching full user info for email: ${email}`);
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { account: true },
    });
    if (!user) {
      this.logger.warn(`User with email ${email} not found`);
      throw new BadRequestException('User not found');
    }
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}