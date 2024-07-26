import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { DishStatus } from 'src/constants/enum';

export class CreateDishDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  @MaxLength(256)
  name: string;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  price: number;

  @IsNotEmpty()
  @IsString()
  @MaxLength(10000)
  description: string;

  @IsNotEmpty()
  @IsString()
  image: string;

  @IsOptional()
  @IsEnum(DishStatus)
  status: DishStatus;
}
