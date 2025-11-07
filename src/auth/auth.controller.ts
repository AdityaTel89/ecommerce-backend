import { Controller, Post, Body, HttpCode, HttpStatus, Logger } from '@nestjs/common'
import { AuthService } from './auth.service'

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger('AuthController')

  constructor(private readonly authService: AuthService) {}

  @Post('signup-otp')
  @HttpCode(HttpStatus.CREATED)
  async registerWithOtp(
    @Body() body: { email: string; firstName: string; lastName: string },
  ) {
    this.logger.log(`Signup OTP request for: ${body.email}`)
    
    if (!body.email || !body.firstName || !body.lastName) {
      throw new Error('Email, firstName, and lastName are required')
    }

    const result = await this.authService.registerWithoutPassword(
      body.email,
      body.firstName,
      body.lastName,
    )
    
    this.logger.log(`Signup OTP successful for: ${body.email}`)
    return result
  }

  @Post('send-otp')
  @HttpCode(HttpStatus.OK)
  async sendOtp(@Body() body: { email: string }) {
    this.logger.log(`Send OTP request for: ${body.email}`)
    
    if (!body.email) {
      throw new Error('Email is required')
    }

    const result = await this.authService.sendOtp(body.email)
    
    this.logger.log(`Send OTP successful for: ${body.email}`)
    return result
  }

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  async verifyOtp(@Body() body: { email: string; otp: string }) {
    this.logger.log(`Verify OTP request for: ${body.email}`)
    
    if (!body.email || !body.otp) {
      throw new Error('Email and OTP are required')
    }

    const result = await this.authService.verifyOtpEmail(body.email, body.otp)
    
    this.logger.log(`Verify OTP successful for: ${body.email}`)
    return result
  }

  @Post('resend-otp')
  @HttpCode(HttpStatus.OK)
  async resendOtp(@Body() body: { email: string }) {
    this.logger.log(`Resend OTP request for: ${body.email}`)
    
    if (!body.email) {
      throw new Error('Email is required')
    }

    const result = await this.authService.resendOtp(body.email)
    
    this.logger.log(`Resend OTP successful for: ${body.email}`)
    return result
  }
}
