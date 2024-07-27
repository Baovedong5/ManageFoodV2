import { Controller, Get, Query } from '@nestjs/common';
import { IndicatorService } from './indicator.service';
import { ResponseMessage, Roles } from 'src/decorators/customize';
import { Role } from 'src/constants/enum';
import { QueryIndicatorDto } from './dto/query-indicator.dto';

@Controller('indicator')
export class IndicatorController {
  constructor(private readonly indicatorService: IndicatorService) {}

  @Roles(Role.Owner, Role.Employee)
  @ResponseMessage('Get the parameters successfully')
  @Get('/dashboard')
  dashboardIndicator(@Query() query: QueryIndicatorDto) {
    return this.indicatorService.dashboardIndicator(query);
  }
}
