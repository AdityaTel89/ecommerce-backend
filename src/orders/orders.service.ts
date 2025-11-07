import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { ProductsService } from '../products/products.service';
import { EmailService } from '../email/email.service';

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
    let totalAmount = 0;
    const orderItems: OrderItem[] = [];

    // Validate and calculate total
    for (const item of createOrderDto.items) {
      const product = await this.productsService.findById(item.productId);
      
      if (product.stock < item.quantity) {
        throw new BadRequestException(`Insufficient stock for ${product.name}`);
      }

      totalAmount += Number(product.price) * item.quantity;
      
      orderItems.push(
        this.orderItemsRepository.create({
          productId: item.productId,
          quantity: item.quantity,
          price: product.price,
        }),
      );
    }

    const order = this.ordersRepository.create({
      userId,
      totalAmount,
      shippingAddress: createOrderDto.shippingAddress,
      shippingCity: createOrderDto.shippingCity,
      shippingZipCode: createOrderDto.shippingZipCode,
      status: OrderStatus.PENDING,
      items: orderItems,
    });

    const savedOrder = await this.ordersRepository.save(order);

    // Send order confirmation email
    await this.emailService.sendOrderConfirmation(userEmail, savedOrder);

    return savedOrder;
  }

  async findById(id: string): Promise<Order> {
    const order = await this.ordersRepository.findOne({
      where: { id },
      relations: ['items', 'items.product'],
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }

  async findByUserId(userId: string): Promise<Order[]> {
    return this.ordersRepository.find({
      where: { userId },
      relations: ['items', 'items.product'],
      order: { createdAt: 'DESC' },
    });
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    await this.ordersRepository.update(id, { status });
    return this.findById(id);
  }
}
