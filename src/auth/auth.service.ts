import { Injectable, BadRequestException, UnauthorizedException, Logger } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { UsersService } from '../users/users.service'
import { EmailService } from '../email/email.service'

@Injectable()
export class AuthService {
  private readonly logger = new Logger('AuthService')

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async registerWithoutPassword(
    email: string,
    firstName: string,
    lastName: string,
  ) {
    try {
      const existingUser = await this.usersService.findByEmail(email)

      if (existingUser && existingUser.isEmailVerified) {
        throw new BadRequestException('Email already registered')
      }

      const otp = this.generateOtp()
      const otpExpiry = new Date(Date.now() + 5 * 60 * 1000)

      if (existingUser) {
        await this.usersService.update(existingUser.id, {
          firstName,
          lastName,
          otp,
          otpExpiry,
        })
      } else {
        await this.usersService.create({
          email,
          firstName,
          lastName,
          otp,
          otpExpiry,
          isEmailVerified: false,
        })
      }

      try {
        await this.emailService.sendOtpEmail(email, otp)
      } catch (err) {
        this.logger.warn(`Email sending failed for ${email}, but continuing`)
      }

      return {
        success: true,
        message: 'Registration successful. OTP sent to email.',
        email,
      }
    } catch (error) {
      this.logger.error('Registration error:', error)
      throw error
    }
  }

  async sendOtp(email: string) {
    try {
      const otp = this.generateOtp()
      const otpExpiry = new Date(Date.now() + 5 * 60 * 1000)

      let user = await this.usersService.findByEmail(email)

      if (!user) {
        user = await this.usersService.create({
          email,
          firstName: '',
          lastName: '',
          otp,
          otpExpiry,
          isEmailVerified: false,
        })
        this.logger.log(`New user created for email: ${email}`)
      } else {
        await this.usersService.update(user.id, {
          otp,
          otpExpiry,
        })
        this.logger.log(`OTP updated for existing user: ${email}`)
      }

      try {
        await this.emailService.sendOtpEmail(email, otp)
      } catch (err) {
        this.logger.warn(`Email sending failed for ${email}, but continuing`)
      }

      return {
        success: true,
        message: 'OTP sent successfully',
        email,
      }
    } catch (error) {
      this.logger.error('Send OTP error:', error)
      throw error
    }
  }

  async verifyOtpEmail(email: string, otp: string): Promise<any> {
    try {
      const user = await this.usersService.findByEmail(email)

      if (!user) {
        throw new BadRequestException('User not found')
      }

      if (!user.otp || user.otp !== otp) {
        throw new BadRequestException('Invalid OTP')
      }

      if (!user.otpExpiry || user.otpExpiry < new Date()) {
        throw new BadRequestException('OTP expired')
      }

      await this.usersService.update(user.id, {
        isEmailVerified: true,
        otp: undefined as any,
        otpExpiry: undefined as any,
      })

      const token = this.jwtService.sign({
        sub: user.id,
        email: user.email,
      })

      this.logger.log(`User verified and logged in: ${email}`)

      return {
        success: true,
        message: 'Email verified successfully',
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      }
    } catch (error) {
      this.logger.error('Verify OTP error:', error)
      throw error
    }
  }

  async resendOtp(email: string) {
    try {
      const user = await this.usersService.findByEmail(email)

      if (!user) {
        throw new BadRequestException('User not found')
      }

      const otp = this.generateOtp()
      const otpExpiry = new Date(Date.now() + 5 * 60 * 1000)

      await this.usersService.update(user.id, { otp, otpExpiry })

      try {
        await this.emailService.sendOtpEmail(email, otp)
      } catch (err) {
        this.logger.warn(`Email sending failed for ${email}, but continuing`)
      }

      this.logger.log(`OTP resent to: ${email}`)

      return {
        success: true,
        message: 'OTP sent successfully',
        email,
      }
    } catch (error) {
      this.logger.error('Resend OTP error:', error)
      throw error
    }
  }

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }
}
