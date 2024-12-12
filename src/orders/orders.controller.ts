import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
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
  @ResponseMessage('Tạo thành công đơn hàng cho khách hàng')
  @Post()
  createOrder(@Body() body: CreateOrderDto, @User() user: IUser) {
    return this.ordersService.create(body, user);
  }

  @Roles(Role.Owner, Role.Employee)
  @ResponseMessage('Thanh toán thành công')
  @Post('/pay')
  paymentOrder(@Body() body: { guestId: number }, @User() orderHandler: IUser) {
    const { guestId } = body;

    return this.ordersService.paymentOrder(guestId, orderHandler);
  }

  @Roles(Role.Owner, Role.Employee)
  @ResponseMessage('Lấy danh sách đơn hàng thành công')
  @Get()
  getListOrder(@Query() query: queryOrderDto) {
    return this.ordersService.getListOrder(query);
  }

  @Roles(Role.Owner, Role.Employee)
  @ResponseMessage('Lấy đơn hàng thành công')
  @Get(':orderId')
  getOrderDetail(@Param('orderId') orderId: string) {
    return this.ordersService.getOrderDetail(+orderId);
  }

  @Roles(Role.Owner, Role.Employee)
  @ResponseMessage('Cập nhật đơn hàng thành công')
  @Patch(':orderId')
  updateOrder(
    @Param('orderId') orderId: string,
    @Body() body: UpdateOrderDto,
    @User() orderHandler: IUser,
  ) {
    return this.ordersService.updateOrder(+orderId, body, orderHandler);
  }

  @Public()
  @ResponseMessage('Cập nhật trạng thái thành công')
  @Post('/update-payment-status')
  updatePaymentStatus(@Body() body: UpdateOrderDto) {
    return this.ordersService.updatePaymentStatus(body);
  }
}
