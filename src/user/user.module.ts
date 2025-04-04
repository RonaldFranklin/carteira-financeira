import { Module } from '@nestjs/common';
import { UsersService } from './user.service';
import { UsersController } from './user.controller';
import { PrismaModule } from 'prisma/prisma.module';
import { AccountModule } from 'src/account/account.module';
import { TransactionModule } from 'src/transaction/transaction.module';

@Module({
  imports: [PrismaModule, AccountModule, TransactionModule],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
