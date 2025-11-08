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
      isGlobal: true,
      envFilePath: '.env',
      ignoreEnvFile: process.env.NODE_ENV === 'production',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const databaseUrl = configService.get('DATABASE_URL')
        const nodeEnv = configService.get('NODE_ENV', 'development')
        
        if (!databaseUrl) {
          throw new Error('❌ DATABASE_URL environment variable is not set')
        }

        console.log(`🔍 Connecting to database in ${nodeEnv} mode`)
        console.log(`🔗 Database URL: ${databaseUrl.substring(0, 20)}...`)

        return {
          type: 'postgres',
          url: databaseUrl,
          entities: [User, Product, Order, OrderItem],
          
          // ✅ TEMPORARY: Enable synchronize to create tables
          synchronize: true,  // Change this back to nodeEnv !== 'production' after first deploy
          
          ssl: nodeEnv === 'production' ? {
            rejectUnauthorized: false,
          } : false,
          
          logging: nodeEnv !== 'production' ? ['error', 'warn', 'query'] : ['error'],
          
          retryAttempts: 10,
          retryDelay: 3000,
          
          extra: {
            max: 10,
            min: 2,
            idleTimeoutMillis: 30000,
          },
        }
      },
    }),
    AuthModule,
    EmailModule,
  ],
})
export class AppModule {}
