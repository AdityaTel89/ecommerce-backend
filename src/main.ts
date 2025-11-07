
import * as dotenv from 'dotenv'
import { config } from 'dotenv'

// Load .env file FIRST
config({ path: '.env' })

import { NestFactory } from '@nestjs/core'
import { ValidationPipe, Logger } from '@nestjs/common'
import { AppModule } from './app.module'
async function bootstrap() {
  // ✅ Print environment BEFORE app creation
  console.log('═══════════════════════════════════════════════════')
  console.log('📋 Environment Variables (from process.env):')
  console.log('═══════════════════════════════════════════════════')
  console.log(`DATABASE_URL: ${process.env.DATABASE_URL ? '✓ SET' : '❌ NOT SET'}`)
  console.log(`NODE_ENV: ${process.env.NODE_ENV || 'NOT SET'}`)
  console.log(`PORT: ${process.env.PORT || 'NOT SET'}`)
  console.log(`CORS_ORIGIN: ${process.env.CORS_ORIGIN || 'NOT SET'}`)
  console.log('═══════════════════════════════════════════════════')

  const app = await NestFactory.create(AppModule)
  const logger = new Logger('Bootstrap')

  const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000'
  
  app.enableCors({
    origin: corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })

  app.setGlobalPrefix('api')

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )

  const port = process.env.PORT || 3001

  try {
    await app.listen(port, '0.0.0.0')
    
    logger.log('═══════════════════════════════════════════════════')
    logger.log(`✅ Application Successfully Started`)
    logger.log('═══════════════════════════════════════════════════')
    logger.log(`🔗 Running on: http://localhost:${port}`)
    logger.log(`📡 API Prefix: /api`)
    logger.log(`🌐 CORS Origin: ${corsOrigin}`)
    logger.log('═══════════════════════════════════════════════════')
  } catch (error) {
    logger.error('❌ Failed to start application:', error)
    process.exit(1)
  }
}

bootstrap()
