import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Order } from '../../orders/entities/order.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true, type: 'varchar', length: 100 })
  firstName?: string;

  @Column({ nullable: true, type: 'varchar', length: 100 })
  lastName?: string;

  @Column({ nullable: true, type: 'varchar', length: 6 })
  otp?: string | null;  // ✅ Allow null

  @Column({ type: 'timestamp', nullable: true })
  otpExpiry?: Date | null;  // ✅ Allow null

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];
}
