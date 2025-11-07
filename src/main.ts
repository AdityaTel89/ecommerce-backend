// ❌ DELETE THIS LINE - doesn't work on Render
// import * as dotenv from 'dotenv'
// dotenv.config()

import { NestFactory } from '@nestjs/core'
import { ValidationPipe, Logger } from '@nestjs/common'
import { AppModule } from './app.module'

async function bootstrap() {
  const logger = new Logger('Bootstrap')

  const app = await NestFactory.create(AppModule)

  app.enableCors({
    origin: [
      'https://ecommerce-frontend-five-kappa.vercel.app',
      'http://localhost:3000',
      'http://localhost:3001',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
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
    logger.log(`✅ Server running on port ${port}`)
    logger.log(`📡 API Prefix: /api`)
    logger.log(`🌐 CORS: Enabled`)
    logger.log('═══════════════════════════════════════════════════')
  } catch (error) {
    logger.error('❌ Failed to start:', error)
    process.exit(1)
  }
}

bootstrap()
