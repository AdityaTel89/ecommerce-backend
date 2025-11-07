import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm'

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string

  @Column({ type: 'varchar', length: 100 })
  firstName: string

  @Column({ type: 'varchar', length: 100 })
  lastName: string

  @Column({ type: 'varchar', length: 255, nullable: true })
  password: string

  @Column({ type: 'boolean', default: false })
  isEmailVerified: boolean

  @Column({ type: 'varchar', length: 6, nullable: true })
  otp: string

  @Column({ type: 'timestamp', nullable: true })
  otpExpiry: Date

  @CreateDateColumn()
  createdAt: Date
}