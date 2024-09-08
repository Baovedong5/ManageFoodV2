import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import ms from 'ms';
import { AccountsService } from 'src/accounts/accounts.service';
import { ChangePasswordDto } from 'src/accounts/dto/change-password.dto';
import { UpdateMeDto } from 'src/accounts/dto/update-me.dto';
import { IUser } from 'src/accounts/user.interface';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => AccountsService))
    private accountService: AccountsService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.accountService.findOneByUsername(username);

    if (user) {
      const isValid = this.accountService.isValidPassword(pass, user.password);

      if (isValid === true) {
        return user;
      }
    }

    return null;
  }

  async login(user: IUser, response: Response) {
    const { id, name, email, role, avatar } = user;

    const payload = {
      sub: 'token login',
      iss: 'from server',
      id,
      name,
      email,
      role,
    };

    const refresh_token = this.createRefreshToken(payload);

    //update user with refresh token
    await this.accountService.updateUserRefreshToken(refresh_token, id);

    //set refresh token in cookie
    response.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      maxAge: ms(this.configService.get<string>('JWT_REFRESH_EXPIRE')),
    });

    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: refresh_token,
      user: {
        id,
        name,
        email,
        role,
        avatar,
      },
    };
  }

  createRefreshToken(payload: any) {
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn:
        ms(this.configService.get<string>('JWT_REFRESH_EXPIRE')) / 1000,
    });
    return refreshToken;
  }

  verifyToken(token: string) {
    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
      });

      return payload;
    } catch (error) {
      throw new UnauthorizedException('Token is invalid');
    }
  }

  async processNewToken(refreshToken: string, response: Response) {
    try {
      this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      });

      let user = await this.accountService.findUserByToken(refreshToken);

      if (user) {
        const { id, name, email, role } = user;

        const payload = {
          sub: 'token refresh',
          iss: 'from server',
          id,
          name,
          email,
          role,
        };

        const refresh_token = this.createRefreshToken(payload);

        //update user with refresh token
        await this.accountService.updateUserRefreshToken(refresh_token, id);

        //clear old refresh token
        response.clearCookie('refresh_token');

        //set refresh token in cookie
        response.cookie('refresh_token', refresh_token, {
          httpOnly: true,
          maxAge: ms(this.configService.get<string>('JWT_REFRESH_EXPIRE')),
        });

        return {
          access_token: this.jwtService.sign(payload),
          refresh_token: refresh_token,
          user: {
            id,
            name,
            email,
            role,
          },
        };
      } else {
        throw new BadRequestException('Refresh token is invalid. Please login');
      }
    } catch (error) {
      throw new BadRequestException('Refresh token is invalid. Please login');
    }
  }

  async logout(response: Response, user: IUser) {
    await this.accountService.updateUserRefreshToken('', user.id);
    response.clearCookie('refresh_token');
    return 'oke';
  }

  async changePassword(user: IUser, body: ChangePasswordDto) {
    return await this.accountService.changePasswordAccount(user.id, body);
  }

  async updateMe(user: IUser, body: UpdateMeDto) {
    return await this.accountService.updateMe(user.id, body);
  }

  async getMe(user: IUser) {
    return await this.accountService.getMe(user.id);
  }
}
