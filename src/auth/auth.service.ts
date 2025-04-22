// src/auth/auth.service.ts
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateOAuthLogin(
    profile: {
      email: string;
      firstName: string;
      lastName: string;
      picture: string;
      id: string;
    },
    provider: string,
  ) {
    try {
      // Check if user exists
      let user = await this.usersService.findByEmail(profile.email);
      if (user) {
        console.log('user already existed, login successfully.');
      }
      if (!user) {
        // Create a new user if not exists
        user = await this.usersService.create({
          email: profile.email,
          firstName: profile.firstName,
          lastName: profile.lastName,
          picture: profile.picture,
          provider,
          providerId: profile.id,
        });
      }

      // Generate JWT token
      const payload = {
        userId: user.id,
        email: user.email,
      };

      const jwt = this.jwtService.sign(payload);
      return { jwt, user };
    } catch (error) {
      throw new Error('Authentication failed');
    }
  }
}
