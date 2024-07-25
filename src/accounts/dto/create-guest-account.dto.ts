import {
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateGuestAccountDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(256)
  name: string;

  @IsNotEmpty()
  tableNumber: number;
}
