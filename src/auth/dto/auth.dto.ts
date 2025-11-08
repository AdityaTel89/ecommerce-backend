import { IsEmail, IsString, IsNotEmpty } from 'class-validator'

export class SignupOtpDto {
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string

  @IsString()
  @IsNotEmpty({ message: 'First name is required' })
  firstName: string

  @IsString()
  @IsNotEmpty({ message: 'Last name is required' })
  lastName: string
}

export class SendOtpDto {
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string
}

export class VerifyOtpDto {
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string

  @IsString()
  @IsNotEmpty({ message: 'OTP is required' })
  otp: string
}

export class ResendOtpDto {
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string
}
