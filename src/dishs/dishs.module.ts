import { Module } from '@nestjs/common';
import { DishsService } from './dishs.service';
import { DishsController } from './dishs.controller';

@Module({
  controllers: [DishsController],
  providers: [DishsService],
})
export class DishsModule {}
