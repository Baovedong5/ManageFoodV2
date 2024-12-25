import { Controller, Get, Post, Body, Res, Req } from '@nestjs/common';
import { GuestsService } from './guests.service';
import { Public, ResponseMessage, Roles, User } from 'src/decorators/customize';
import { GuestLoginDto } from './dto/guest-login.dto';
import { Request, Response } from 'express';
import { IUser } from 'src/accounts/user.interface';
import { Role } from 'src/constants/enum';
import { guestCreateOrderDto } from './dto/guest-create-order.dto';
import { EventGateway } from 'src/sockets/gateways/event.gateway';
import { ManagerRoom } from 'src/constants/type';

@Controller('guests')
export class GuestsController {
  constructor(
    private readonly guestsService: GuestsService,
    private eventGateway: EventGateway,
  ) {}

  @Public()
  @ResponseMessage('Đăng nhập thành công')
  @Post('/auth/login')
  guestLogin(
    @Body() body: GuestLoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.guestsService.guestLogin(body, response);
  }

  @ResponseMessage('Đăng xuất thành công')
  @Post('/auth/logout')
  guestLogout(
    @Res({ passthrough: true }) response: Response,
    @User() user: IUser,
  ) {
    return this.guestsService.guestLogout(response, user);
  }

  @Public()
  @ResponseMessage('Lấy token mới thành công')
  @Post('/auth/refresh-token')
  guestRefreshToken(@Body('refresh_token') refresh_token: string) {
    return this.guestsService.guestRefreshToken(refresh_token);
  }

  @Roles(Role.Guest)
  @ResponseMessage('Đặt món thành công')
  @Post('/orders')
  async guestCreateOrder(
    @Body() body: guestCreateOrderDto[],
    @User() user: IUser,
  ) {
    const result = await this.guestsService.guestCreateOrder(body, user);
    this.eventGateway.handleEmitSocket({
      data: result,
      event: 'new-order',
      to: ManagerRoom,
    });
    return result;
  }

  @Roles(Role.Guest)
  @ResponseMessage('Lấy danh sách đơn hàng thành công')
  @Get('/orders')
  guestGetListOrder(@User() user: IUser) {
    return this.guestsService.guestGetListOrder(user);
  }

  @Roles(Role.Guest)
  @ResponseMessage('Thanh toán trực tiếp')
  @Post('/payment-vnpay')
  guestPaymentVnPay(@Body() body: { guestId: number; paymentRef: string }) {
    return this.guestsService.guestPayment(body);
  }
}
