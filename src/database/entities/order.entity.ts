import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'uuid' })
  userId: string

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number

  @Column({ type: 'varchar', length: 50, default: 'pending' })
  status: string

  @Column({ type: 'jsonb', nullable: true })
  customerInfo: any

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}