import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm'
import { ConfigService } from '@nestjs/config'
import { User } from './entities/user.entity'
import { Product } from './entities/product.entity'
import { Order } from './entities/order.entity'
import { OrderItem } from './entities/orderItem.entity'

export const databaseConfig = (
  configService: ConfigService,
): TypeOrmModuleAsyncOptions => {
  return {
    useFactory: async () => {
      const databaseUrl = configService.get('DATABASE_URL')

      if (!databaseUrl) {
        throw new Error('DATABASE_URL is required')
      }

      return {
        type: 'postgres',
        url: databaseUrl,
        entities: [User, Product, Order, OrderItem],
        synchronize: true,
        ssl: { rejectUnauthorized: false },
        logging: false,
        retryAttempts: 5,
        retryDelay: 3000,
      } as any
    },
    inject: [ConfigService],
  }
}
