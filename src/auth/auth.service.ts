import { Injectable, BadRequestException, ConflictException, Logger } from '@nestjs/common'
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
      this.logger.log(`🔍 Checking if user exists: ${email}`)
      const existingUser = await this.usersService.findByEmail(email)

      if (existingUser && existingUser.isEmailVerified) {
        this.logger.warn(`⚠️ User already registered and verified: ${email}`)
        throw new ConflictException('Email already registered and verified')
      }

      const otp = this.generateOtp()
      const otpExpiry = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes

      this.logger.log(`🔑 Generated OTP for ${email}: ${otp}`)

      if (existingUser) {
        this.logger.log(`📝 Updating existing unverified user: ${email}`)
        await this.usersService.update(existingUser.id, {
          firstName,
          lastName,
          otp,
          otpExpiry,
        })
      } else {
        this.logger.log(`➕ Creating new user: ${email}`)
        await this.usersService.create({
          email,
          firstName,
          lastName,
          otp,
          otpExpiry,
          isEmailVerified: false,
        })
      }

      // ✅ Send email asynchronously without blocking the response
      setImmediate(() => {
        this.emailService.sendOtpEmail(email, otp)
          .then(() => this.logger.log(`✅ Email sent successfully to: ${email}`))
          .catch(err => {
            this.logger.error(`❌ Email sending failed for ${email}:`, err.message)
            this.logger.warn(`⚠️ OTP saved in DB: ${otp}`)
          })
      })

      this.logger.log(`✅ Registration complete, returning response`)

      return {
        success: true,
        message: 'Registration successful. OTP sent to email.',
        email,
        otp, // ⚠️ TEMPORARY - Shows OTP for testing. Remove in production!
      }
    } catch (error) {
      this.logger.error(`❌ Registration error for ${email}:`, error.message)
      this.logger.error(`Error stack:`, error.stack)
      throw error
    }
  }

  async sendOtp(email: string) {
    try {
      this.logger.log(`🔍 Looking up user: ${email}`)
      const otp = this.generateOtp()
      const otpExpiry = new Date(Date.now() + 5 * 60 * 1000)

      let user = await this.usersService.findByEmail(email)

      if (!user) {
        this.logger.log(`➕ Creating new user for: ${email}`)
        user = await this.usersService.create({
          email,
          firstName: '',
          lastName: '',
          otp,
          otpExpiry,
          isEmailVerified: false,
        })
      } else {
        this.logger.log(`📝 Updating OTP for existing user: ${email}`)
        await this.usersService.update(user.id, {
          otp,
          otpExpiry,
        })
      }

      // ✅ Send email asynchronously without blocking
      setImmediate(() => {
        this.emailService.sendOtpEmail(email, otp)
          .then(() => this.logger.log(`✅ OTP email sent to: ${email}`))
          .catch(err => {
            this.logger.error(`❌ Email sending failed for ${email}:`, err.message)
            this.logger.warn(`⚠️ OTP saved in DB: ${otp}`)
          })
      })

      return {
        success: true,
        message: 'OTP sent successfully',
        email,
        otp, // ⚠️ TEMPORARY for testing
      }
    } catch (error) {
      this.logger.error(`❌ Send OTP error:`, error.message)
      throw error
    }
  }

  async verifyOtpEmail(email: string, otp: string): Promise<any> {
    try {
      this.logger.log(`🔍 Verifying OTP for: ${email}`)
      const user = await this.usersService.findByEmail(email)

      if (!user) {
        this.logger.warn(`⚠️ User not found: ${email}`)
        throw new BadRequestException('User not found')
      }

      this.logger.log(`🔑 Checking OTP. Provided: ${otp}, Stored: ${user.otp}`)

      if (!user.otp || user.otp !== otp) {
        this.logger.warn(`⚠️ Invalid OTP for ${email}`)
        throw new BadRequestException('Invalid OTP')
      }

      if (!user.otpExpiry || user.otpExpiry < new Date()) {
        this.logger.warn(`⚠️ OTP expired for ${email}`)
        throw new BadRequestException('OTP expired')
      }

      this.logger.log(`✅ OTP verified, updating user: ${email}`)
      await this.usersService.update(user.id, {
        isEmailVerified: true,
        otp: undefined,
        otpExpiry: undefined,
      })

      const token = this.jwtService.sign({
        sub: user.id,
        email: user.email,
      })

      this.logger.log(`🎫 JWT token generated for: ${email}`)

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
      this.logger.error(`❌ Verify OTP error:`, error.message)
      throw error
    }
  }

  async resendOtp(email: string) {
    try {
      this.logger.log(`🔍 Resending OTP for: ${email}`)
      const user = await this.usersService.findByEmail(email)

      if (!user) {
        this.logger.warn(`⚠️ User not found: ${email}`)
        throw new BadRequestException('User not found')
      }

      const otp = this.generateOtp()
      const otpExpiry = new Date(Date.now() + 5 * 60 * 1000)

      await this.usersService.update(user.id, { otp, otpExpiry })

      // ✅ Send email asynchronously without blocking
      setImmediate(() => {
        this.emailService.sendOtpEmail(email, otp)
          .then(() => this.logger.log(`✅ OTP resent to: ${email}`))
          .catch(err => {
            this.logger.error(`❌ Email sending failed for ${email}:`, err.message)
            this.logger.warn(`⚠️ OTP saved in DB: ${otp}`)
          })
      })

      this.logger.log(`✅ OTP updated for: ${email}`)

      return {
        success: true,
        message: 'OTP sent successfully',
        email,
        otp, // ⚠️ TEMPORARY for testing
      }
    } catch (error) {
      this.logger.error(`❌ Resend OTP error:`, error.message)
      throw error
    }
  }

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }
}
