import { Controller, Post, Body } from '@nestjs/common'
import { AuthService } from './auth.service'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup-otp')
  async registerWithOtp(
    @Body() body: { email: string; firstName: string; lastName: string },
  ) {
    return this.authService.registerWithoutPassword(
      body.email,
      body.firstName,
      body.lastName,
    )
  }

  @Post('send-otp')
  async sendOtp(@Body() body: { email: string }) {
    return this.authService.sendOtp(body.email)
  }

  @Post('verify-otp')
  async verifyOtp(@Body() body: { email: string; otp: string }) {
    return this.authService.verifyOtpEmail(body.email, body.otp)
  }

  @Post('resend-otp')
  async resendOtp(@Body() body: { email: string }) {
    return this.authService.resendOtp(body.email)
  }
}
