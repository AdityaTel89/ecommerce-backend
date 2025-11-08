import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Order } from '../database/entities/order.entity'
import { OrderItem } from '../database/entities/orderItem.entity'
import { CreateOrderDto } from './dto/create-order.dto'
import { ProductsService } from '../products/products.service'
import { EmailService } from '../email/email.service'

// Define OrderStatus enum
export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemsRepository: Repository<OrderItem>,
    private productsService: ProductsService,
    private emailService: EmailService,
  ) {}

  async create(userId: string, userEmail: string, createOrderDto: CreateOrderDto): Promise<Order> {
    let totalAmount = 0
    const orderItems: OrderItem[] = []

    // Validate and calculate total
    for (const item of createOrderDto.items) {
      const product = await this.productsService.findById(item.productId)
      
      if (product.stock < item.quantity) {
        throw new BadRequestException(`Insufficient stock for ${product.name}`)
      }

      totalAmount += Number(product.price) * item.quantity
      
      const orderItem = this.orderItemsRepository.create({
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
      })
      
      orderItems.push(orderItem)
    }

    // Create order with correct properties
    const order = this.ordersRepository.create({
      userId,
      totalAmount,
      status: OrderStatus.PENDING,
      customerInfo: {
        shippingAddress: createOrderDto.shippingAddress,
        shippingCity: createOrderDto.shippingCity,
        shippingZipCode: createOrderDto.shippingZipCode,
      },
    })

    // Save order first
    const savedOrder = await this.ordersRepository.save(order)
    
    // Save order items with the orderId
    for (const item of orderItems) {
      item.orderId = savedOrder.id
    }
    await this.orderItemsRepository.save(orderItems)

    // Send order confirmation email (async, non-blocking)
    setImmediate(() => {
      this.emailService.sendOrderConfirmation(userEmail, savedOrder)
        .catch(err => console.error('Failed to send order confirmation email:', err))
    })

    // Fetch and return complete order with relations
    return this.findById(savedOrder.id)
  }

  async findById(id: string): Promise<Order> {
    const order = await this.ordersRepository.findOne({
      where: { id },
      relations: ['items', 'items.product'],
    })
    if (!order) {
      throw new NotFoundException('Order not found')
    }
    return order
  }

  async findByUserId(userId: string): Promise<Order[]> {
    return this.ordersRepository.find({
      where: { userId },
      relations: ['items', 'items.product'],
      order: { createdAt: 'DESC' },
    })
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    await this.ordersRepository.update(id, { status })
    return this.findById(id)
  }
}
