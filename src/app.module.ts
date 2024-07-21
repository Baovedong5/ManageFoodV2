import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from 'src/db/data-source';
import { ConfigModule } from '@nestjs/config';
import { AccountsModule } from './accounts/accounts.module';
import { OrdersModule } from './orders/orders.module';
import { SocketsModule } from './sockets/sockets.module';
import { DishsModule } from './dishs/dishs.module';
import { DishsnapshotsModule } from './dishsnapshots/dishsnapshots.module';
import { TablesModule } from './tables/tables.module';
import { GuestsModule } from './guests/guests.module';
import { AuthModule } from './auth/auth.module';
import { SeedsModule } from './seeds/seeds.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(dataSourceOptions),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AccountsModule,
    OrdersModule,
    SocketsModule,
    DishsModule,
    DishsnapshotsModule,
    TablesModule,
    GuestsModule,
    AuthModule,
    SeedsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
