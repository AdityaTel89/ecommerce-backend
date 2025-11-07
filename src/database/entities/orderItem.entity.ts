import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm'

@Entity('orderItems')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'uuid' })
  orderId: string

  @Column({ type: 'uuid' })
  productId: string

  @Column({ type: 'integer' })
  quantity: number

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number

  @CreateDateColumn()
  createdAt: Date
}