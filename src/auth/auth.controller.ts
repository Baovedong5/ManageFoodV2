import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public, ResponseMessage, User } from 'src/decorators/customize';
import { LocalAuthGuard } from './local-auth.guard';
import { IUser } from 'src/accounts/user.interface';
import { Request, Response } from 'express';
import { UpdateMeDto } from 'src/accounts/dto/update-me.dto';
import { ChangePasswordDto } from 'src/accounts/dto/change-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @ResponseMessage('Login successfully')
  @Post('/login')
  handleLogin(@Req() req, @Res({ passthrough: true }) response: Response) {
    return this.authService.login(req.user, response);
  }

  @ResponseMessage('Get user information successfully')
  @Get('/me')
  handleGetAccount(@User() user: IUser) {
    return { user };
  }

  @ResponseMessage('Update infomation successfully')
  @Patch('/me')
  handleUpdateMe(@User() user: IUser, @Body() body: UpdateMeDto) {
    return this.authService.updateMe(user, body);
  }

  @Public()
  @ResponseMessage('Get user by refresh token successfully')
  @Post('/refresh')
  handleRefreshToken(
    @Body('refresh_token') refreshToken: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.processNewToken(refreshToken, response);
  }

  @ResponseMessage('Logout successfully')
  @Post('/logout')
  handleLogout(
    @Res({ passthrough: true }) response: Response,
    @User() user: IUser,
  ) {
    return this.authService.logout(response, user);
  }

  @ResponseMessage('Change password successfully')
  @Patch('/change-password')
  handleChangePassword(@User() user: IUser, @Body() body: ChangePasswordDto) {
    return this.authService.changePassword(user, body);
  }
}
