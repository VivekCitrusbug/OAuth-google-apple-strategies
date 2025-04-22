// src/auth/strategies/apple.strategy.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import * as fs from 'fs';
import * as jwt from 'jsonwebtoken';
import { Strategy } from 'passport-apple';
import * as path from 'path';
import { AuthService } from '../auth.service';

@Injectable()
export class AppleStrategy extends PassportStrategy(Strategy, 'apple') {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    const keyFilePath = configService.get<string>('APPLE_KEY_FILE_PATH');
    if (!keyFilePath) {
      throw new Error('APPLE_KEY_FILE_PATH is not defined');
    }
    const keyContent = fs.readFileSync(path.resolve(keyFilePath));

    super({
      clientID: configService.get<string>('APPLE_CLIENT_ID'),
      teamID: configService.get<string>('APPLE_TEAM_ID'),
      keyID: configService.get<string>('APPLE_KEY_ID'),
      privateKeyString: keyContent.toString(),
      callbackURL: configService.get<string>('APPLE_CALLBACK_URL'),
      passReqToCallback: true,
      scope: ['name', 'email'],
    });
  }

  async validate(
    req: any,
    accessToken: string,
    refreshToken: string,
    idToken: string,
    profile: any,
    done: Function,
  ): Promise<any> {
    try {
      // Apple doesn't always send profile info (only on first login)
      // So we need to decode the idToken to get user info
      const decodedToken: any = jwt.decode(idToken);

      // Initial user object with email
      const user = {
        id: decodedToken.sub, // Apple user ID
        email: decodedToken.email,
        firstName: '',
        lastName: '',
        picture: '',
        accessToken,
      };

      // If this is a first-time login, Apple sends user info in the request body
      if (req.body && req.body.user) {
        const userInfo = JSON.parse(req.body.user);
        if (userInfo.name) {
          user.firstName = userInfo.name.firstName || '';
          user.lastName = userInfo.name.lastName || '';
        }
      }

      const { jwt: authToken, user: userRecord } =
        await this.authService.validateOAuthLogin(user, 'apple');
      done(null, { jwt: authToken, user: userRecord });
    } catch (error) {
      done(error, false);
    }
  }
}
