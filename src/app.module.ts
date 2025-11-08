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
      ignoreEnvFile: process.env.NODE_ENV === 'production', // Don't load .env in production
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
        console.log(`🔗 Database URL: ${databaseUrl.substring(0, 20)}...`) // Log partial URL for security

        return {
          type: 'postgres',
          url: databaseUrl,
          entities: [User, Product, Order, OrderItem],
          
          // ⚠️ CRITICAL: Never use synchronize: true in production
          // It can cause data loss when schema changes
          synchronize: nodeEnv !== 'production', // Only auto-sync in development
          
          // SSL configuration for production databases
          ssl: nodeEnv === 'production' ? {
            rejectUnauthorized: false, // Required for most cloud databases
          } : false,
          
          // Logging - helpful for debugging
          logging: nodeEnv !== 'production' ? ['error', 'warn', 'query'] : ['error'],
          
          // Connection retry settings
          retryAttempts: 10,
          retryDelay: 3000,
          
          // Connection pool settings for better performance
          extra: {
            max: 10, // Maximum number of connections
            min: 2,  // Minimum number of connections
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
