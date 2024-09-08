import { IsOptional } from 'class-validator';

export class queryOrderDto {
  @IsOptional()
  fromDate?: Date;

  @IsOptional()
  toDate?: Date;
}
