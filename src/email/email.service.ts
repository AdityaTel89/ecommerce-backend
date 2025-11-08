import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Order } from '../database/entities/order.entity'

@Injectable()
export class EmailService {
  private readonly logger = new Logger('EmailService')

  constructor(private configService: ConfigService) {
    this.logger.log('✅ Email service initialized')
  }

  async sendOtpEmail(email: string, otp: string): Promise<void> {
    this.logger.log(`📧 OTP email would be sent to: ${email}`)
    this.logger.log(`🔑 OTP: ${otp}`)
    this.logger.log(`💡 Note: Email sending requires verified domain. OTP is returned in API response.`)
    // No actual email sending - OTP is in the API response
  }

  async sendOrderConfirmation(email: string, order: Order): Promise<void> {
    this.logger.log(`📧 Order confirmation would be sent to: ${email}`)
    this.logger.log(`📦 Order ID: ${order.id}`)
    // No actual email sending
  }
}
