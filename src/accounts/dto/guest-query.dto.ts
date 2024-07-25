import { IsOptional, IsDateString } from 'class-validator';

export class GetGuestListQueryDto {
  @IsOptional()
  @IsDateString()
  fromDate?: Date;

  @IsOptional()
  @IsDateString()
  toDate?: Date;
}
