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
  @ResponseMessage('Login successfully')
  @Post('/auth/login')
  guestLogin(
    @Body() body: GuestLoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.guestsService.guestLogin(body, response);
  }

  @ResponseMessage('Logout successfully')
  @Post('/auth/logout')
  guestLogout(
    @Res({ passthrough: true }) response: Response,
    @User() user: IUser,
  ) {
    return this.guestsService.guestLogout(response, user);
  }

  @ResponseMessage('Get new token successfully')
  @Post('/auth/refresh-token')
  guestRefreshToken(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const guestRefreshToken = request.cookies['guest_refresh_token'];

    return this.guestsService.guestRefreshToken(guestRefreshToken, response);
  }

  @Roles(Role.Guest)
  @ResponseMessage('Order successfully')
  @Post('/orders')
  guestCreateOrder(@Body() body: guestCreateOrderDto[], @User() user: IUser) {
    return this.guestsService.guestCreateOrder(body, user);
  }

  @Roles(Role.Guest)
  @ResponseMessage('Get lish order successfully')
  @Get('/orders')
  guestGetListOrder(@User() user: IUser) {
    return this.guestsService.guestGetListOrder(user);
  }
}
