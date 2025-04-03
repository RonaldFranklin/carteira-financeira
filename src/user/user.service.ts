import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private prisma: PrismaService) {}

  private generateUniqueAccountNumber(): string {
    return Math.floor(1000000000 + Math.random() * 9000000000).toString();
  }

  // criacao do usuario e uma conta vinculada
  async createUser(data: CreateUserDto) {
    this.logger.log(`Starting user creation for email: ${data.email}`);

    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existingUser) { // erro caso ja exista um usuario com o email cadastrado
      this.logger.warn(`Email already registered: ${data.email}`);
      throw new BadRequestException('Email already registered');
    }

    // criptografia da senha e criacao do usuario
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: hashedPassword,
      },
    });
    this.logger.log(`User created successfully with ID: ${user.id}`);

    // criacao de uma conta vinculada ao usuario
    const account = await this.prisma.account.create({
      data: {
        userId: user.id,
        number: this.generateUniqueAccountNumber(),
        balance: 0,
      },
    });
    this.logger.log(`Account created for user ${user.id} with number: ${account.number}`);

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

  async getAllUsers() {
    this.logger.log('Listing all users');
    return this.prisma.user.findMany();
  }

  async updateUser(id: number, updateData: UpdateUserDto) {
    this.logger.log(`Updating user with ID: ${id}`);
    await this.findById(id);
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
      this.logger.verbose(`Password updated for user ${id}`);
    }
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateData,
    });
    this.logger.log(`User with ID ${id} updated successfully`);
    return updatedUser;
  }

  async deleteUser(id: number) {
    this.logger.log(`Deleting user with ID: ${id}`);
    await this.findById(id);
    const deletedUser = await this.prisma.user.delete({ where: { id } });
    this.logger.log(`User with ID ${id} deleted successfully`);
    return deletedUser;
  }
}
