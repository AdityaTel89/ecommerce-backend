import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, VerifyOtpDto } from './dto';

@Controller('auth')  // ✅ Change to 'auth' only
export class AuthController {
  constructor(private authService: AuthService) {}

  // ✅ POST /auth/signup-otp
  @Post('signup-otp')
  async registerWithOtp(@Body() body: { email: string; firstName: string; lastName: string }) {
    return this.authService.registerWithoutPassword(body.email, body.firstName, body.lastName);
  }

  // ✅ POST /auth/signup
  @Post('signup')
  async register(@Body() body: { email: string; password: string; firstName: string; lastName: string }) {
    return this.authService.register(body.email, body.password, body.firstName, body.lastName);
  }

  // ✅ POST /auth/login
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  // ✅ POST /auth/verify-otp
  @Post('verify-otp')
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.authService.verifyOtpEmail(verifyOtpDto.email, verifyOtpDto.otp);
  }

  // ✅ POST /auth/send-otp
  @Post('send-otp')
  async sendOtp(@Body() body: { email: string }) {
    return this.authService.sendOtp(body.email);
  }

  // ✅ POST /auth/resend-otp
  @Post('resend-otp')
  async resendOtp(@Body() body: { email: string }) {
    return this.authService.resendOtp(body.email);
  }
}
