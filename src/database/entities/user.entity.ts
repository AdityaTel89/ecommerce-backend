import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm'

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'varchar', length: 255, unique: true })
  @Index()
  email: string

  @Column({ type: 'varchar', length: 100, nullable: true })
  firstName: string

  @Column({ type: 'varchar', length: 100, nullable: true })
  lastName: string

  @Column({ type: 'varchar', length: 6, nullable: true })
  otp: string

  @Column({ type: 'timestamp', nullable: true })
  otpExpiry: Date

  @Column({ type: 'boolean', default: false })
  isEmailVerified: boolean

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date
}
