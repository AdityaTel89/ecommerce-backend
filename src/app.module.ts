import { Controller, Get, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { databaseConfig } from './database/database.config'
import { AuthModule } from './auth/auth.module'
import { EmailModule } from './email/email.module'

// ✅ Health Check Controller
@Controller()
export class HealthController {
  @Get('health')
  health() {
    return { status: 'ok', message: 'Backend is running!' }
  }

  @Get('api/health')
  apiHealth() {
    return { status: 'ok', timestamp: new Date() }
  }
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const databaseUrl = configService.get('DATABASE_URL')
        if (databaseUrl) {
          return {
            type: 'postgres',
            url: databaseUrl,
            autoLoadEntities: true,
            synchronize: configService.get('NODE_ENV') !== 'production',
            ssl: { rejectUnauthorized: false },
            logging: ['error', 'warn'],
          }
        }
        return {
          type: 'postgres',
          host: configService.get('DB_HOST', 'localhost'),
          port: configService.get('DB_PORT', 5432),
          username: configService.get('DB_USERNAME', 'postgres'),
          password: configService.get('DB_PASSWORD', 'postgres'),
          database: configService.get('DB_NAME', 'ecommerce'),
          autoLoadEntities: true,
          synchronize: true,
          logging: true,
        }
      },
    }),
    AuthModule,
    EmailModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
