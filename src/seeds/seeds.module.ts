import { Module } from '@nestjs/common';
import { SeedsService } from './seeds.service';
import { SeedsController } from './seeds.controller';
import { Account } from 'src/accounts/entities/account.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountsModule } from 'src/accounts/accounts.module';

@Module({
  imports: [TypeOrmModule.forFeature([Account]), AccountsModule],
  controllers: [SeedsController],
  providers: [SeedsService],
})
export class SeedsModule {}
