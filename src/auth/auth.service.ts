import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';
import { LoginDto } from './dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  // ✅ New signup without password
  async registerWithoutPassword(email: string, firstName: string, lastName: string) {
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new BadRequestException('Email already registered');
    }

    // Generate a random password for users who signup with OTP only
    const randomPassword = this.generateRandomPassword();
    const hashedPassword = await bcrypt.hash(randomPassword, 10);
    const otp = this.generateOtp();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    const user = await this.usersService.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      otp,
      otpExpiry,
      isEmailVerified: false,
    });

    await this.emailService.sendOtpEmail(email, otp);

    return {
      message: 'Registration successful. OTP sent to email.',
      email: user.email,
    };
  }

  // Old signup with password (optional, can keep or remove)
  async register(email: string, password: string, firstName: string, lastName: string) {
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new BadRequestException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = this.generateOtp();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    const user = await this.usersService.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      otp,
      otpExpiry,
      isEmailVerified: false,
    });

    await this.emailService.sendOtpEmail(email, otp);

    return {
      message: 'User registered successfully. OTP sent to email.',
      email: user.email,
    };
  }

  async sendOtp(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const otp = this.generateOtp();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    await this.usersService.update(user.id, { otp, otpExpiry });
    await this.emailService.sendOtpEmail(email, otp);

    return {
      message: 'OTP sent successfully',
      email,
    };
  }

  async verifyOtpEmail(email: string, otp: string): Promise<any> {
    const isValid = await this.verifyOtp(email, otp);
    
    if (!isValid) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    const user = await this.usersService.findByEmail(email);
    
    if (!user) {
      throw new BadRequestException('User not found');
    }

    await this.usersService.update(user.id, { 
      isEmailVerified: true,
      otp: null,
      otpExpiry: null 
    });

    // ✅ Auto-login after OTP verification
    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
    });

    return {
      valid: true,
      message: 'Email verified successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.isEmailVerified) {
      const token = this.jwtService.sign({
        sub: user.id,
        email: user.email,
      });

      return {
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      };
    }

    if (!loginDto.password || loginDto.password.length === 0) {
      throw new BadRequestException('Email not verified. Please verify with OTP first.');
    }

    const passwordMatch = await bcrypt.compare(loginDto.password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
    });

    return {
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }

  async verifyOtp(email: string, otp: string): Promise<boolean> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (!user.otp || user.otp !== otp) {
      return false;
    }

    if (!user.otpExpiry || user.otpExpiry < new Date()) {
      return false;
    }

    return true;
  }

  async resendOtp(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const otp = this.generateOtp();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    await this.usersService.update(user.id, { otp, otpExpiry });
    await this.emailService.sendOtpEmail(email, otp);

    return {
      message: 'OTP sent successfully',
      email,
    };
  }

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private generateRandomPassword(): string {
  // ✅ Ensure password meets requirements: uppercase, lowercase, numbers, 8+ chars
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const special = '!@#$%^&*';
  
  let password = '';
  
  // Add at least one of each required character
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];
  
  // Fill the rest to reach 12 characters
  const allChars = uppercase + lowercase + numbers + special;
  for (let i = password.length; i < 12; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

}
