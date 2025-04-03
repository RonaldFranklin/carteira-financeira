import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('user')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('create')
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto);
  }

  @Get('list')
  @UseGuards(AuthGuard('jwt'))
  async getAllUsers() {
    return this.usersService.getAllUsers();
  }

  @Get('get/:id')
  @UseGuards(AuthGuard('jwt'))
  async getUser(@Param('id') id: string) {
    return this.usersService.findById(Number(id));
  }

  @Put('update/:id')
  @UseGuards(AuthGuard('jwt'))
  async updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateUser(Number(id), updateUserDto);
  }

  @Delete('delete/:id')
  @UseGuards(AuthGuard('jwt'))
  async deleteUser(@Param('id') id: string) {
    return this.usersService.deleteUser(Number(id));
  }
}
