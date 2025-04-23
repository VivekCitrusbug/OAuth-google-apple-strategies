// src/auth/strategies/github.strategy.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';
import { AuthService } from '../auth.service';

@Injectable()
export class GitHubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      clientID: configService.get<string>('GITHUB_CLIENT_ID') || '',
      clientSecret: configService.get<string>('GITHUB_CLIENT_SECRET') || '',
      callbackURL: configService.get<string>('GITHUB_CALLBACK_URL') || '',
      scope: ['user:email'], // This scope is important to get user's email
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: Function,
  ): Promise<any> {
    const { id, displayName, photos, emails } = profile;

    // GitHub might not provide email directly in some cases
    // but we requested the 'user:email' scope to ensure we get it
    const email = emails && emails.length > 0 ? emails[0].value : null;

    // Some GitHub users might not have their names publicly available
    // so we handle that gracefully
    const nameParts = displayName ? displayName.split(' ') : ['', ''];
    const firstName = nameParts[0] || '';
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

    const user = {
      id,
      email,
      firstName,
      lastName,
      picture: photos && photos.length > 0 ? photos[0].value : null,
      accessToken,
    };

    const { jwt, user: userRecord } = await this.authService.validateOAuthLogin(
      user,
      'github',
    );
    done(null, { jwt, user: userRecord });
  }
}
