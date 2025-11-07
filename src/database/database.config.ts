import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm'
import { ConfigService } from '@nestjs/config'
import { User } from './entities/user.entity'
import { Product } from './entities/product.entity'
import { Order } from './entities/order.entity'
import { OrderItem } from './entities/orderItem.entity'

export const databaseConfig = (
  configService: ConfigService,
): TypeOrmModuleAsyncOptions => ({
  useFactory: () => {
    // ✅ Check if DATABASE_URL exists (Railway style)
    const databaseUrl = configService.get('DATABASE_URL')
    
    if (databaseUrl) {
      return {
        type: 'postgres',
        url: databaseUrl,
        entities: [User, Product, Order, OrderItem],
        synchronize: configService.get('NODE_ENV') !== 'production',
        ssl: {
          rejectUnauthorized: false, // Required for Railway
        },
        logging: true,
      }
    }

    // ✅ Fallback to individual env vars
    return {
      type: 'postgres',
      host: configService.get('DB_HOST'),
      port: configService.get('DB_PORT'),
      username: configService.get('DB_USERNAME'),
      password: configService.get('DB_PASSWORD'),
      database: configService.get('DB_NAME'),
      entities: [User, Product, Order, OrderItem],
      synchronize: configService.get('NODE_ENV') !== 'production',
      ssl: {
        rejectUnauthorized: false,
      },
      logging: true,
    }
  },
  inject: [ConfigService],
})
