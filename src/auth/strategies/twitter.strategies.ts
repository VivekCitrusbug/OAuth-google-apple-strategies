// src/auth/strategies/twitter.strategy.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-twitter';
import { AuthService } from '../auth.service';

@Injectable()
export class TwitterStrategy extends PassportStrategy(Strategy, 'twitter') {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      consumerKey: configService.get<string>('TWITTER_CONSUMER_KEY') || '',
      consumerSecret: configService.get<string>('TWITTER_CONSUMER_SECRET') || '',
      callbackURL: 'oob', // Use 'oob' (out-of-band) for desktop applications
      includeEmail: true, // Request email from Twitter API (requires application permission)
      passReqToCallback: true,
    });
  }

  async validate(
    req: Request,
    token: string,
    tokenSecret: string,
    profile: Profile,
    done: (error: Error | null, user?: any) => void,
  ): Promise<void> {
    try {
      // Safe type handling for profile data
      if (!profile) {
        throw new Error('Profile data is missing');
      }

      // Extract user information from the Twitter profile with proper type safety
      const id = typeof profile.id === 'string' ? profile.id : String(profile.id);
      const displayName = typeof profile.displayName === 'string' ? profile.displayName : '';
      
      // Safely handle emails and photos arrays
      const emails = Array.isArray(profile.emails) ? profile.emails : [];
      const photos = Array.isArray(profile.photos) ? profile.photos : [];

      // Split displayName into firstName and lastName (Twitter doesn't provide separate fields)
      const nameParts = displayName.split(' ');
      const firstName = nameParts.length > 0 ? nameParts[0] : '';
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

      // Create user object with the profile information
      const user = {
        id,
        email: emails.length > 0 && emails[0] && typeof emails[0].value === 'string' 
          ? emails[0].value 
          : `${id}@twitter.com`, // Twitter may not always provide email
        firstName,
        lastName,
        picture: photos.length > 0 && photos[0] && typeof photos[0].value === 'string' 
          ? photos[0].value 
          : '',
        accessToken: token,
      };

      // Validate the user through the auth service
      const { jwt, user: userRecord } = await this.authService.validateOAuthLogin(user, 'twitter');

      done(null, { jwt, user: userRecord });
    } catch (error) {
      if (error instanceof Error) {
        done(error, false);
      } else {
        done(new Error('Authentication failed'), false);
      }
    }
  }
}
