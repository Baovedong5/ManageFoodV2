import { Module } from '@nestjs/common';
import { DishsnapshotsService } from './dishsnapshots.service';
import { DishsnapshotsController } from './dishsnapshots.controller';

@Module({
  controllers: [DishsnapshotsController],
  providers: [DishsnapshotsService],
})
export class DishsnapshotsModule {}
