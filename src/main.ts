import * as dotenv from 'dotenv'
dotenv.config()

import { NestFactory } from '@nestjs/core'
import { ValidationPipe, Logger } from '@nestjs/common'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const logger = new Logger('Bootstrap')

  // ✅ GET CORS FROM ENV
  const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000'
  
  logger.log(`🌐 CORS Origin: ${corsOrigin}`)

  // ✅ ENABLE CORS PROPERLY
  app.enableCors({
    origin: corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 200,
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
    logger.log(`🔗 Running on port: ${port}`)
    logger.log(`📡 API Prefix: /api`)
    logger.log(`🌐 CORS Origin: ${corsOrigin}`)
    logger.log('═══════════════════════════════════════════════════')
  } catch (error) {
    logger.error('❌ Failed to start:', error)
    process.exit(1)
  }
}

bootstrap()
