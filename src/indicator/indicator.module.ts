import { Module } from '@nestjs/common';
import { IndicatorService } from './indicator.service';
import { IndicatorController } from './indicator.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from 'src/orders/entities/order.entity';
import { Guest } from 'src/guests/entities/guest.entity';
import { Dish } from 'src/dishs/entities/dish.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, Guest, Dish])],
  controllers: [IndicatorController],
  providers: [IndicatorService],
})
export class IndicatorModule {}
