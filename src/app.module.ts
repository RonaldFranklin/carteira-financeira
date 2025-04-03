import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from 'prisma/prisma.module'; // Se você tiver um módulo dedicado ao Prisma
import { UsersModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { AccountModule } from './account/account.module';
import { TransactionModule } from './transaction/transaction.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    UsersModule,
    AuthModule,
    AccountModule,
    TransactionModule,
  ],
})
export class AppModule {}
