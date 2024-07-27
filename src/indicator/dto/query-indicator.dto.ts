import { IsOptional, IsDate } from 'class-validator';

export class QueryIndicatorDto {
  @IsOptional()
  @IsDate()
  fromDate?: Date;

  @IsOptional()
  @IsDate()
  toDate?: Date;
}
