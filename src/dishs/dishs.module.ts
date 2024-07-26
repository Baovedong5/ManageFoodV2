import { Module } from '@nestjs/common';
import { DishsService } from './dishs.service';
import { DishsController } from './dishs.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dish } from './entities/dish.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Dish])],
  controllers: [DishsController],
  providers: [DishsService],
})
export class DishsModule {}
