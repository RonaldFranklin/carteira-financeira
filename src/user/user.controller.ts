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
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';

@ApiTags('user')
@ApiBearerAuth()
@Controller('user')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post('create')
  @ApiOperation({ summary: 'Criar um novo usuário' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: 'Usuário criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Email já registrado' })
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto);
  }

  @Get('list')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Listar todos os usuários' })
  @ApiResponse({ status: 200, description: 'Usuários retornados com sucesso' })
  @UseGuards(AuthGuard('jwt'))
  async getAllUsers() {
    return this.usersService.getAllUsers();
  }

  @Get('get/:accountNumber')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Buscar usuário pelo número da conta' })
  @ApiParam({ name: 'accountNumber', description: 'Número da conta' })
  @ApiResponse({ status: 200, description: 'Usuário retornado com sucesso' })
  @UseGuards(AuthGuard('jwt'))
  async getUser(@Param('accountNumber') accountNumber: string) {
    return this.usersService.findByAccountNumber(accountNumber);
  }

  @Get('getById/:id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Buscar usuário pelo ID' })
  @ApiParam({ name: 'id', description: 'ID do usuário' })
  @ApiResponse({ status: 200, description: 'Usuário retornado com sucesso' })
  @UseGuards(AuthGuard('jwt'))
  async getUserById(@Param('id') id: string) {
    return this.usersService.findById(Number(id));
  }

  @Get('getByEmail/:email')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Buscar informações completas do usuário pelo e-mail' })
  @ApiParam({ name: 'email', description: 'Email do usuário' })
  @ApiResponse({ status: 200, description: 'Informações do usuário e conta retornadas com sucesso' })
  @ApiResponse({ status: 400, description: 'Usuário não encontrado' })
  async getUserWithAccount(@Param('email') email: string) {
    return this.usersService.getFullUserInfoByEmail(email);
  }


  @Put('update/:accountNumber')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Atualizar usuário pelo número da conta' })
  @ApiParam({ name: 'accountNumber', description: 'Número da conta do usuário' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, description: 'Usuário atualizado com sucesso' })
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
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Deletar usuário pelo número da conta' })
  @ApiParam({ name: 'accountNumber', description: 'Número da conta do usuário' })
  @ApiResponse({ status: 200, description: 'Usuário deletado com sucesso' })
  async deleteUser(@Param('accountNumber') accountNumber: string) {
    return this.usersService.deleteUserByAccountNumber(accountNumber);
  }
}