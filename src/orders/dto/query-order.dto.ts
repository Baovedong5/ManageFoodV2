import { IsDateString, IsOptional } from 'class-validator';

export class queryOrderDto {
  @IsOptional()
  @IsDateString()
  fromDate?: Date;

  @IsOptional()
  @IsDateString()
  toDate?: Date;
}
