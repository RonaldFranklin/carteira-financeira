import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { AccountService } from './account.service';
import { UpdateAccountDto } from './dto/update-account.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('account')
@UseGuards(AuthGuard('jwt'))
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  // Endpoint to get the account associated with a user
  @Get(':userId')
  async getAccount(@Param('userId') userId: string) {
    return this.accountService.getAccountByUserId(Number(userId));
  }

  // Endpoint for deposit
  @Post('deposit/:userId')
  async deposit(
    @Param('userId') userId: string,
    @Body() updateAccountDto: UpdateAccountDto,
  ) {
    return this.accountService.deposit(Number(userId), updateAccountDto.amount);
  }

  // Endpoint for withdrawal
  @Post('withdraw/:userId')
  async withdraw(
    @Param('userId') userId: string,
    @Body() updateAccountDto: UpdateAccountDto,
  ) {
    return this.accountService.withdraw(Number(userId), updateAccountDto.amount);
  }
}
