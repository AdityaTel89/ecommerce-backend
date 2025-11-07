import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Order } from '../orders/entities/order.entity';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get('EMAIL_USER'),
        pass: this.configService.get('EMAIL_PASSWORD'),
      },
    });
  }

  async sendOtpEmail(email: string, otp: string): Promise<void> {
    try {
      const htmlContent = this.getOtpEmailTemplate(otp);

      await this.transporter.sendMail({
        from: this.configService.get('EMAIL_FROM'),
        to: email,
        subject: 'Your OTP for Email Verification - Foodzy',
        html: htmlContent,
      });
    } catch (error) {
      console.error('Failed to send OTP email:', error);
      throw new BadRequestException('Failed to send OTP email. Please check your email configuration.');
    }
  }

  async sendOrderConfirmation(email: string, order: Order): Promise<void> {
    try {
      const htmlContent = this.getOrderConfirmationTemplate(order);

      await this.transporter.sendMail({
        from: this.configService.get('EMAIL_FROM'),
        to: email,
        subject: `Order Confirmation - Order #${order.id}`,
        html: htmlContent,
      });
    } catch (error) {
      console.error('Failed to send order confirmation email:', error);
      throw new BadRequestException('Failed to send order confirmation email.');
    }
  }

  private getOtpEmailTemplate(otp: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #FF6B6B 0%, #FF8E72 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
            .header p { margin: 5px 0 0 0; font-size: 14px; opacity: 0.9; }
            .content { padding: 40px 30px; text-align: center; }
            .greeting { font-size: 18px; color: #333; margin-bottom: 20px; }
            .message { font-size: 16px; color: #666; margin-bottom: 30px; line-height: 1.6; }
            .otp-box { background-color: #f9f9f9; padding: 30px; margin: 30px 0; border-left: 5px solid #FF6B6B; border-radius: 4px; }
            .otp-label { font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 15px; }
            .otp { font-size: 48px; font-weight: 700; color: #FF6B6B; letter-spacing: 12px; font-family: 'Courier New', monospace; margin: 0; }
            .validity { font-size: 13px; color: #999; margin-top: 15px; }
            .footer { text-align: center; padding: 30px 20px; color: #666; font-size: 12px; border-top: 1px solid #eee; }
            .footer p { margin: 5px 0; }
            .note { font-size: 13px; color: #999; margin-top: 20px; font-style: italic; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🍕 Foodzy</h1>
              <p>Email Verification</p>
            </div>
            <div class="content">
              <p class="greeting">Hello!</p>
              <p class="message">Thank you for registering with Foodzy! We're excited to have you on board.</p>
              <p class="message">To complete your email verification, please use the OTP (One-Time Password) below:</p>
              
              <div class="otp-box">
                <div class="otp-label">Your Verification Code</div>
                <div class="otp">${otp}</div>
                <div class="validity">Valid for 5 minutes</div>
              </div>
              
              <p class="message">This OTP is valid for 5 minutes only. Do not share this code with anyone.</p>
              <p class="note">If you didn't request this verification, please ignore this email or contact our support team.</p>
            </div>
            <div class="footer">
              <p>&copy; 2025 Foodzy. All rights reserved.</p>
              <p>This is an automated email. Please do not reply to this address.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private getOrderConfirmationTemplate(order: Order): string {
    const itemsHtml = order.items
      .map(
        (item) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #ddd; text-align: left;">${item.product.name}</td>
        <td style="padding: 12px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #ddd; text-align: right;">₹${Number(item.price).toFixed(2)}</td>
        <td style="padding: 12px; border-bottom: 1px solid #ddd; text-align: right;">₹${(Number(item.price) * item.quantity).toFixed(2)}</td>
      </tr>
    `,
      )
      .join('');

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
            .content { padding: 30px; }
            .order-id { background-color: #f5f5f5; padding: 15px; border-radius: 4px; margin: 20px 0; text-align: center; }
            .order-id-label { font-size: 12px; color: #999; text-transform: uppercase; }
            .order-id-value { font-size: 20px; font-weight: 600; color: #2196F3; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            thead { background-color: #f5f5f5; }
            th { padding: 12px; text-align: left; font-weight: 600; color: #333; font-size: 13px; text-transform: uppercase; }
            td { padding: 12px; }
            .total-row { background-color: #f9f9f9; }
            .total-row td { font-weight: 600; font-size: 16px; }
            .address { margin: 20px 0; padding: 15px; background-color: #f9f9f9; border-radius: 4px; }
            .address-label { font-size: 12px; color: #999; text-transform: uppercase; font-weight: 600; margin-bottom: 8px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; border-top: 1px solid #eee; }
            .footer p { margin: 5px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📦 Order Confirmation</h1>
            </div>
            <div class="content">
              <p>Hello,</p>
              <p>Thank you for your order! We're processing it right now and will send you an update as soon as it ships.</p>
              
              <div class="order-id">
                <div class="order-id-label">Order Number</div>
                <div class="order-id-value">#${order.id}</div>
              </div>
              
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th style="text-align: center;">Qty</th>
                    <th style="text-align: right;">Price</th>
                    <th style="text-align: right;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                  <tr class="total-row">
                    <td colspan="3" style="text-align: right;">Total Amount:</td>
                    <td style="text-align: right;">₹${Number(order.totalAmount).toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
              
              <div class="address">
                <div class="address-label">Shipping Address</div>
                <p style="margin: 8px 0; color: #333;">
                  ${order.shippingAddress}<br>
                  ${order.shippingCity}, ${order.shippingZipCode}
                </p>
              </div>
              
              <p>We will notify you as soon as your order is shipped. You can track your order status anytime.</p>
              <p>Thank you for shopping with Foodzy!</p>
            </div>
            <div class="footer">
              <p>&copy; 2025 Foodzy. All rights reserved.</p>
              <p>This is an automated email. Please do not reply to this address.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}
