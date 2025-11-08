import { Controller, Post, Body, HttpCode, HttpStatus, Logger } from '@nestjs/common'
import { AuthService } from './auth.service'
import { SignupOtpDto, SendOtpDto, VerifyOtpDto, ResendOtpDto } from './dto/auth.dto'

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger('AuthController')

  constructor(private readonly authService: AuthService) {}

  @Post('signup-otp')
  @HttpCode(HttpStatus.CREATED)
  async registerWithOtp(@Body() signupOtpDto: SignupOtpDto) {
    this.logger.log(`📨 Signup OTP request for: ${signupOtpDto.email}`)
    this.logger.log(`📋 Request body: ${JSON.stringify(signupOtpDto)}`)
    
    try {
      const result = await this.authService.registerWithoutPassword(
        signupOtpDto.email,
        signupOtpDto.firstName,
        signupOtpDto.lastName,
      )
      
      this.logger.log(`✅ Signup OTP successful for: ${signupOtpDto.email}`)
      return result
    } catch (error) {
      this.logger.error(`❌ Signup OTP error for ${signupOtpDto.email}:`, error.message)
      this.logger.error(`Stack trace:`, error.stack)
      throw error
    }
  }

  @Post('send-otp')
  @HttpCode(HttpStatus.OK)
  async sendOtp(@Body() sendOtpDto: SendOtpDto) {
    this.logger.log(`📨 Send OTP request for: ${sendOtpDto.email}`)
    
    try {
      const result = await this.authService.sendOtp(sendOtpDto.email)
      this.logger.log(`✅ Send OTP successful for: ${sendOtpDto.email}`)
      return result
    } catch (error) {
      this.logger.error(`❌ Send OTP error for ${sendOtpDto.email}:`, error.message)
      throw error
    }
  }

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    this.logger.log(`📨 Verify OTP request for: ${verifyOtpDto.email}`)
    
    try {
      const result = await this.authService.verifyOtpEmail(verifyOtpDto.email, verifyOtpDto.otp)
      this.logger.log(`✅ Verify OTP successful for: ${verifyOtpDto.email}`)
      return result
    } catch (error) {
      this.logger.error(`❌ Verify OTP error for ${verifyOtpDto.email}:`, error.message)
      throw error
    }
  }

  @Post('resend-otp')
  @HttpCode(HttpStatus.OK)
  async resendOtp(@Body() resendOtpDto: ResendOtpDto) {
    this.logger.log(`📨 Resend OTP request for: ${resendOtpDto.email}`)
    
    try {
      const result = await this.authService.resendOtp(resendOtpDto.email)
      this.logger.log(`✅ Resend OTP successful for: ${resendOtpDto.email}`)
      return result
    } catch (error) {
      this.logger.error(`❌ Resend OTP error for ${resendOtpDto.email}:`, error.message)
      throw error
    }
  }
}
