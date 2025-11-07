import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm'
import { Order } from './order.entity'
import { Product } from './product.entity'

@Entity('orderItems')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'uuid' })
  orderId: string

  @ManyToOne(() => Order, (order) => order.items)
  @JoinColumn({ name: 'orderId' })
  order: Order

  @Column({ type: 'uuid' })
  productId: string

  @ManyToOne(() => Product, (product) => product.orderItems, { eager: true })
  @JoinColumn({ name: 'productId' })
  product: Product

  @Column({ type: 'integer' })
  quantity: number

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number

  @CreateDateColumn()
  createdAt: Date
}
