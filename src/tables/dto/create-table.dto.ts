import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive } from 'class-validator';
import { TableStatus } from 'src/constants/enum';

export class CreateTableDto {
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  number: number;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  capacity: number;

  @IsOptional()
  @IsEnum(TableStatus)
  status: TableStatus;
}
