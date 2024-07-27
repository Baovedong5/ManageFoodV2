import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { Public, ResponseMessage, Roles, User } from 'src/decorators/customize';
import { Role } from 'src/constants/enum';
import { CreateOrderDto } from './dto/create-order.dto';
import { IUser } from 'src/accounts/user.interface';
import { queryOrderDto } from './dto/query-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Roles(Role.Owner, Role.Employee)
  @ResponseMessage('Successfully create orders for customers')
  @Post()
  createOrder(@Body() body: CreateOrderDto, @User() user: IUser) {
    return this.ordersService.create(body, user);
  }

  @Roles(Role.Owner, Role.Employee)
  @ResponseMessage('Payment successfully')
  @Post('/payment')
  paymentOrder(@Body() guestId: number, @User() orderHandler: IUser){
    return this.ordersService.paymentOrder(guestId, orderHandler);
  }

  @Roles(Role.Owner, Role.Employee)
  @ResponseMessage('Get list order successfully')
  @Get()
  getListOrder(@Query() query: queryOrderDto) {
    return this.ordersService.getListOrder(query);
  }

  @Roles(Role.Owner, Role.Employee)
  @ResponseMessage('Get information order successfully')
  @Get(':orderId')
  getOrderDetail(@Param('orderId') orderId: string) {
    return this.ordersService.getOrderDetail(+orderId);
  }

  @Roles(Role.Owner, Role.Employee)
  @ResponseMessage('Update order successfully')
  @Patch(':orderId')
  updateOrder(
    @Param('orderId') orderId: string,
    @Body() body: UpdateOrderDto,
    @User() orderHandler: IUser,
  ) {
    return this.ordersService.updateOrder(+orderId, body, orderHandler);
  }
}
