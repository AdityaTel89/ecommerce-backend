import * as dotenv from 'dotenv'
dotenv.config()

import { NestFactory } from '@nestjs/core'
import { ValidationPipe, Logger } from '@nestjs/common'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const logger = new Logger('Bootstrap')

  // ✅ DIRECT FRONTEND URL + LOCAL DEV
  const corsOrigins = [
    'https://ecommerce-frontend-five-kappa.vercel.app',
    'http://localhost:3000',
    'http://localhost:3001',
  ]

  logger.log(`🌐 CORS Origins: ${corsOrigins.join(', ')}`)

  // ✅ ENABLE CORS PROPERLY
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Length', 'X-JSON-Response-Size'],
    optionsSuccessStatus: 200,
    preflightContinue: false,
    maxAge: 3600,
  })

  // ✅ SET GLOBAL API PREFIX
  app.setGlobalPrefix('api')

  // ✅ GLOBAL VALIDATION PIPE
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
    logger.log(`🔗 Running on port: ${port}`)
    logger.log(`📡 API Prefix: /api`)
    logger.log(`🌐 CORS Origins: ${corsOrigins.join(', ')}`)
    logger.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`)
    logger.log('═══════════════════════════════════════════════════')
  } catch (error) {
    logger.error('❌ Failed to start:', error)
    process.exit(1)
  }
}

bootstrap()
