import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { AccountService } from './account.service';
import { UpdateAccountDto } from './dto/update-account.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';

@ApiTags('account') 
@ApiBearerAuth()
@Controller('account')
@UseGuards(AuthGuard('jwt'))
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Get(':accountNumber')
  @ApiOperation({ summary: 'Buscar dados de uma conta pelo número' })
  @ApiParam({ name: 'accountNumber', description: 'Número da conta' })
  @ApiResponse({ status: 200, description: 'Conta retornada com sucesso' })
  @ApiResponse({ status: 404, description: 'Conta não encontrada' })
  async getAccount(@Param('accountNumber') accountNumber: string) {
    return this.accountService.getAccountByNumber(accountNumber);
  }

  @Post('deposit/:accountNumber')
  @ApiOperation({ summary: 'Realizar depósito em uma conta' })
  @ApiParam({ name: 'accountNumber', description: 'Número da conta' })
  @ApiBody({ type: UpdateAccountDto })
  @ApiResponse({ status: 200, description: 'Depósito realizado com sucesso' })
  @ApiResponse({ status: 400, description: 'Valor inválido' })
  async deposit(
    @Param('accountNumber') accountNumber: string,
    @Body() updateAccountDto: UpdateAccountDto,
  ) {
    return this.accountService.deposit(accountNumber, updateAccountDto.amount);
  }

  @Post('withdraw/:accountNumber')
  @ApiOperation({ summary: 'Realizar saque em uma conta' })
  @ApiParam({ name: 'accountNumber', description: 'Número da conta' })
  @ApiBody({ type: UpdateAccountDto })
  @ApiResponse({ status: 200, description: 'Saque realizado com sucesso' })
  @ApiResponse({ status: 400, description: 'Saldo insuficiente ou valor inválido' })
  async withdraw(
    @Param('accountNumber') accountNumber: string,
    @Body() updateAccountDto: UpdateAccountDto,
  ) {
    return this.accountService.withdraw(accountNumber, updateAccountDto.amount);
  }
}

