import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { OrderStatus } from 'src/constants/enum';

export class UpdateOrderDto {
  @IsOptional()
  @IsNumber()
  dishId: number;

  @IsOptional()
  @IsNumber()
  quantity: number;

  @IsOptional()
  @IsEnum(OrderStatus)
  status: OrderStatus;

  @IsOptional()
  @IsString()
  paymentRef: string;
}
