import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.get<string>('GOOGLE_REDIRECT_URI'),
      scope: ['email', 'profile'],
    });
  }

  async validate(
    access_token: string,
    refresh_token: string,
    profile: Profile,
  ) {
    console.log('access_token', access_token);
    console.log('refresh_token', refresh_token);
    console.log('profile', profile);
  }
}
