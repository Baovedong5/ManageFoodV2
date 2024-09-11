import { IsOptional, IsDateString } from 'class-validator';

export class QueryIndicatorDto {
  @IsOptional()
  @IsDateString()
  fromDate?: Date;

  @IsOptional()
  @IsDateString()
  toDate?: Date;
}
