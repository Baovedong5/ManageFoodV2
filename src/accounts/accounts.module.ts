import { forwardRef, Module } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { AccountsController } from './accounts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from './entities/account.entity';
import { SocketIo } from 'src/sockets/entities/socket.entity';
import { SocketsModule } from 'src/sockets/sockets.module';
import { AuthModule } from 'src/auth/auth.module';
import { Table } from 'src/tables/entities/table.entity';
import { Guest } from 'src/guests/entities/guest.entity';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    TypeOrmModule.forFeature([Account, SocketIo, Table, Guest]),
    SocketsModule,
  ],
  controllers: [AccountsController],
  providers: [AccountsService],
  exports: [AccountsService],
})
export class AccountsModule {}
