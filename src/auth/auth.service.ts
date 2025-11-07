import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { UsersService } from '../users/users.service'
import { EmailService } from '../email/email.service'

@Injectable()
export class AuthService {
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

    await this.emailService.sendOtpEmail(email, otp)

    return {
      message: 'Registration successful. OTP sent to email.',
      email,
    }
  }

  async sendOtp(email: string) {
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
    } else {
      await this.usersService.update(user.id, {
        otp,
        otpExpiry,
      })
    }

    await this.emailService.sendOtpEmail(email, otp)

    return {
      message: 'OTP sent successfully',
      email,
    }
  }

  async verifyOtpEmail(email: string, otp: string): Promise<any> {
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

    // ✅ FIX: Set to undefined or empty string instead of null
    await this.usersService.update(user.id, {
      isEmailVerified: true,
      otp: undefined as any,
      otpExpiry: undefined as any,
    })

    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
    })

    return {
      message: 'Email verified successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    }
  }

  async resendOtp(email: string) {
    const user = await this.usersService.findByEmail(email)

    if (!user) {
      throw new BadRequestException('User not found')
    }

    const otp = this.generateOtp()
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000)

    await this.usersService.update(user.id, { otp, otpExpiry })
    await this.emailService.sendOtpEmail(email, otp)

    return {
      message: 'OTP sent successfully',
      email,
    }
  }

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }
}
