import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { AccountService } from './account.service';
import { UpdateAccountDto } from './dto/update-account.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('account')
@UseGuards(AuthGuard('jwt'))
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Get(':accountNumber')
  async getAccount(@Param('accountNumber') accountNumber: string) {
    return this.accountService.getAccountByNumber(accountNumber);
  }

  @Post('deposit/:accountNumber')
  async deposit(
    @Param('accountNumber') accountNumber: string,
    @Body() updateAccountDto: UpdateAccountDto,
  ) {
    return this.accountService.deposit(accountNumber, updateAccountDto.amount);
  }

  @Post('withdraw/:accountNumber')
  async withdraw(
    @Param('accountNumber') accountNumber: string,
    @Body() updateAccountDto: UpdateAccountDto,
  ) {
    return this.accountService.withdraw(accountNumber, updateAccountDto.amount);
  }
}

