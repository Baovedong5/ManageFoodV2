import { Controller } from '@nestjs/common';
import { DishsnapshotsService } from './dishsnapshots.service';

@Controller('dishsnapshots')
export class DishsnapshotsController {
  constructor(private readonly dishsnapshotsService: DishsnapshotsService) {}
}
