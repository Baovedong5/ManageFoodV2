import {
  IsNotEmpty,
  IsNumber,
  ValidateNested,
  IsArray,
  IsOptional,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';

class OrderItemDto {
  @IsNotEmpty()
  @IsNumber()
  dishId: number;

  @IsNotEmpty()
  @IsNumber()
  quantity: number;
}

export class CreateOrderDto {
  @IsNotEmpty()
  @IsNumber()
  guestId: number;

  @IsOptional()
  @IsString()
  paymentRef: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  orders: OrderItemDto[];
}
