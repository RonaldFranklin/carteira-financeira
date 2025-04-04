import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';

@ApiTags('transaction') 
@ApiBearerAuth()
@Controller('transaction')
@UseGuards(AuthGuard('jwt'))
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  @ApiOperation({ summary: 'Criar uma nova transação entre contas' })
  @ApiBody({ type: CreateTransactionDto })
  @ApiResponse({ status: 201, description: 'Transação criada com sucesso' })
  @ApiResponse({ status: 400, description: 'Saldo insuficiente ou conta inválida' })
  async createTransaction(@Body() createTransactionDto: CreateTransactionDto) {
    return this.transactionService.createTransaction(createTransactionDto);
  }

  @Get('account/:accountId')
  @ApiOperation({ summary: 'Listar todas as transações de uma conta' })
  @ApiParam({ name: 'accountId', description: 'ID da conta' })
  @ApiResponse({ status: 200, description: 'Lista de transações' })
  async listTransactionsByAccount(@Param('accountId') accountId: string) {
    return this.transactionService.listTransactionsByAccount(Number(accountId));
  }

  @Post('reverse/:transactionId')
  @ApiOperation({ summary: 'Reverter uma transação (se possível)' })
  @ApiParam({ name: 'transactionId', description: 'ID da transação' })
  @ApiResponse({ status: 200, description: 'Transação revertida com sucesso' })
  @ApiResponse({ status: 400, description: 'Transação não pode ser revertida' })
  async reverseTransaction(@Param('transactionId') transactionId: string) {
    return this.transactionService.reverseTransaction(Number(transactionId));
  }

  @Get(':transactionId/user/:userId')
  @ApiOperation({ summary: 'Buscar transação específica para um usuário' })
  @ApiParam({ name: 'transactionId', description: 'ID da transação' })
  @ApiParam({ name: 'userId', description: 'ID do usuário' })
  @ApiResponse({ status: 200, description: 'Transação retornada com sucesso' })
  @ApiResponse({ status: 400, description: 'Transação não associada ao usuário' })
  async getTransactionForUser(
    @Param('transactionId') transactionId: string,
    @Param('userId') userId: string,
  ) {
    return this.transactionService.getTransactionForUser(Number(transactionId), Number(userId));
  }
}
