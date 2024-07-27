import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { Guest } from 'src/guests/entities/guest.entity';
import { Table } from 'src/tables/entities/table.entity';
import { Dish } from 'src/dishs/entities/dish.entity';
import { DishSnapshot } from 'src/dishsnapshots/entities/dishsnapshot.entity';
import { SocketIo } from 'src/sockets/entities/socket.entity';
import { SocketsModule } from 'src/sockets/sockets.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      Guest,
      Table,
      Dish,
      DishSnapshot,
      SocketIo,
    ]),
    SocketsModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
