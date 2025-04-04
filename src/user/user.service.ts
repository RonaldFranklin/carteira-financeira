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
  ) {}

  private generateUniqueAccountNumber(): string {
    return Math.floor(1000000000 + Math.random() * 9000000000).toString();
  }

  // Criação do usuário e uma conta vinculada
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

  async findByEmail(email: string) {
    this.logger.log(`Searching for user by email: ${email}`);

    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      this.logger.warn(`User not found for email: ${email}`);
      throw new BadRequestException('User not found for email');
    }

    return user;
  }

  async findById(id: number) {
    this.logger.log(`Searching for user with ID: ${id}`);

    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      this.logger.error(`User with ID ${id} not found`);
      throw new BadRequestException(`User with ID not found`);
    }

    return user;
  }

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

  async getAllUsers() {
    this.logger.log('Listing all users');
    return this.prisma.user.findMany();
  }

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
}