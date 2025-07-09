// src/auth/auth.controller.ts
import { Controller, Post, Body, Get, Req, Res } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { ResetPasswordDto, ResetPasswordNoCodeDto, SendCodeDto, VerifyCodeDto } from '../data/data';
import { Response } from 'express';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    const user = await this.authService.validateUser(body.email, body.password);
    return this.authService.login(user);
  }

  @Post('send-code')
  async sendCode(@Body() dto: SendCodeDto) {
    return this.authService.sendResetCode(dto.email);
  }

  @Post('verify-code')
  async verifyCode(@Body() dto: VerifyCodeDto) {
    const valid = this.authService.verifyCode(dto.email, dto.code);
    return { valid };
  }

  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.email, dto.code, dto.newPassword);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req: any, @Res() res: Response) {
    const user = await this.authService.validateOrCreateSocialUser({
      email: req.user.email,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      provider: 'google',
      providerId: req.user.providerId,
      picture: req.user.picture,
    });
  }

  @Post('google')
async loginWithGoogleToken(@Body() body: { token: string }) {
  const googleUser = await this.authService.verifyGoogleToken(body.token);

  const user = await this.authService.validateOrCreateSocialUser({
    email: googleUser.email!,
    firstName: googleUser.given_name!,
    lastName: googleUser.family_name!,
    provider: 'google',
    providerId: googleUser.sub,
    picture: googleUser.picture,
  });

  return this.authService.generateJWT(user);
}
@UseGuards(AuthGuard('jwt'))
@Post('reset-password-nocode')
  async resetPasswordNoCode(@Body() dto: ResetPasswordNoCodeDto) {
    return this.authService.resetPasswordNoCode(dto.email, dto.newPassword);
  }

}
