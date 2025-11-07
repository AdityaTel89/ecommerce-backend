import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from './database/entities/user.entity'
import { Product } from './database/entities/product.entity'
import { Order } from './database/entities/order.entity'
import { OrderItem } from './database/entities/orderItem.entity'
import { AuthModule } from './auth/auth.module'
import { EmailModule } from './email/email.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,  // ✅ ADD THIS - Makes ConfigService available everywhere
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const databaseUrl = configService.get('DATABASE_URL')
        
        if (!databaseUrl) {
          throw new Error('DATABASE_URL environment variable is not set')
        }

        return {
          type: 'postgres',
          url: databaseUrl,
          entities: [User, Product, Order, OrderItem],
          synchronize: true,
          ssl: {
            rejectUnauthorized: false,
          },
          logging: false,
          retryAttempts: 5,
          retryDelay: 3000,
        }
      },
    }),
    AuthModule,
    EmailModule,
  ],
})
export class AppModule {}
