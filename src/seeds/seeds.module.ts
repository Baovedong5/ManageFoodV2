import { Module } from '@nestjs/common';
import { SeedsService } from './seeds.service';
import { SeedsController } from './seeds.controller';
import { Account } from 'src/accounts/entities/account.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountsService } from 'src/accounts/accounts.service';

@Module({
  imports: [TypeOrmModule.forFeature([Account])],
  controllers: [SeedsController],
  providers: [SeedsService, AccountsService],
})
export class SeedsModule {}
