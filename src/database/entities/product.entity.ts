import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm'

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'varchar', length: 255 })
  title: string

  @Column({ type: 'text', nullable: true })
  description: string

  @Column({ type: 'varchar', length: 100 })
  category: string

  @Column({ type: 'varchar', length: 100 })
  brand: string

  @Column({ type: 'varchar', length: 500, nullable: true })
  image: string

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  originalPrice: number

  @Column({ type: 'float', default: 0 })
  rating: number

  @Column({ type: 'varchar', length: 100, nullable: true })
  badge: string

  @Column({ type: 'integer', default: 0 })
  stock: number

  @CreateDateColumn()
  createdAt: Date
}