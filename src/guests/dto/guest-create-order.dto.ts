import { IsNotEmpty, IsNumber } from 'class-validator';

export class guestCreateOrderDto {
  @IsNotEmpty()
  @IsNumber()
  dishId: number;

  @IsNotEmpty()
  @IsNumber()
  quantity: number;
}
