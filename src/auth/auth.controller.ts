// src/auth/auth.controller.ts
import { Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private configService: ConfigService) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleAuth() {
    // This route initiates the Google OAuth flow
  }

  @Get('home')
  @UseGuards(AuthGuard('google'))
  googleAuthCallback(@Req() req: Request, @Res() res: Response) {
    // Redirect to frontend with token
    return res.send(`login successfully., ${JSON.stringify(req.user)}`);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token') // Add it here too
  @Get('profile')
  getProfile(@Req() req: Request) {
    return req.user;
  }

  // Apple Auth Routes
  @Get('apple')
  @UseGuards(AuthGuard('apple'))
  appleAuth() {
    // This route initiates the Apple Sign In flow
  }

  // Apple requires a POST callback
  @Post('apple/callback')
  @UseGuards(AuthGuard('apple'))
  appleAuthCallback(@Req() req: Request, @Res() res: Response) {
    return res.send(`login successfully., ${JSON.stringify(req.user)}`);
  }

  // GitHub auth routes
  @Get('github')
  @UseGuards(AuthGuard('github'))
  githubAuth() {
    // This route initiates the GitHub OAuth flow
  }

  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  githubAuthCallback(@Req() req: Request, @Res() res: Response) {
    return res.send(`login successfully., ${JSON.stringify(req.user)}`);
  }

  // Twitter auth routes
  @Get('twitter')
  @UseGuards(AuthGuard('twitter'))
  twitterAuth() {
    // This route initiates the Twitter OAuth flow
  }

  @Get('twitter/callback')
  @UseGuards(AuthGuard('twitter'))
  twitterAuthCallback(@Req() req: Request, @Res() res: Response) {
    return res.send(`login successfully., ${JSON.stringify(req.user)}`);
  }
}
