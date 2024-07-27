import { IsDate, IsOptional } from 'class-validator';

export class queryOrderDto {
  @IsOptional()
  @IsDate()
  fromDate?: Date;

  @IsOptional()
  @IsDate()
  toDate?: Date;
}
