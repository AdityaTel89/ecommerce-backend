import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from '../database/entities/user.entity'

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(data: Partial<User>): Promise<User> {
    const user = this.usersRepository.create(data)
    return this.usersRepository.save(user)
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } })
  }

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } })
    if (!user) {
      throw new NotFoundException('User not found')
    }
    return user
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    await this.usersRepository.update(id, data)
    return this.findById(id)
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find()
  }
}
