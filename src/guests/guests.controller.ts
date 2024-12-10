import { Controller, Get, Post, Body, Res, Req } from '@nestjs/common';
import { GuestsService } from './guests.service';
import { Public, ResponseMessage, Roles, User } from 'src/decorators/customize';
import { GuestLoginDto } from './dto/guest-login.dto';
import { Request, Response } from 'express';
import { IUser } from 'src/accounts/user.interface';
import { Role } from 'src/constants/enum';
import { guestCreateOrderDto } from './dto/guest-create-order.dto';

@Controller('guests')
export class GuestsController {
  constructor(private readonly guestsService: GuestsService) {}

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
  guestCreateOrder(@Body() body: guestCreateOrderDto[], @User() user: IUser) {
    return this.guestsService.guestCreateOrder(body, user);
  }

  @Roles(Role.Guest)
  @ResponseMessage('Lấy danh sách đơn hàng thành công')
  @Get('/orders')
  guestGetListOrder(@User() user: IUser) {
    return this.guestsService.guestGetListOrder(user);
  }
}
