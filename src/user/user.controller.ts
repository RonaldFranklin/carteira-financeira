import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('user')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post('create')
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto);
  }

  @Get('list')
  @UseGuards(AuthGuard('jwt'))
  async getAllUsers() {
    return this.usersService.getAllUsers();
  }

  @Get('get/:accountNumber')
  @UseGuards(AuthGuard('jwt'))
  async getUser(@Param('accountNumber') accountNumber: string) {
    return this.usersService.findByAccountNumber(accountNumber);
  }

  @Get('getById/:id')
  @UseGuards(AuthGuard('jwt'))
  async getUserById(@Param('id') id: string) {
    return this.usersService.findById(Number(id));
  }

  @Put('update/:accountNumber')
  @UseGuards(AuthGuard('jwt'))
  async updateUser(
    @Param('accountNumber') accountNumber: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.updateUserByAccountNumber(
      accountNumber,
      updateUserDto,
    );
  }

  @Delete('delete/:accountNumber')
  @UseGuards(AuthGuard('jwt'))
  async deleteUser(@Param('accountNumber') accountNumber: string) {
    return this.usersService.deleteUserByAccountNumber(accountNumber);
  }
}