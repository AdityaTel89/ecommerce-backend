// ✅ PRODUCTION READY - main.ts

import { NestFactory } from '@nestjs/core'
import { ValidationPipe, Logger } from '@nestjs/common'
import { AppModule } from './app.module'

async function bootstrap() {
  const logger = new Logger('Bootstrap')

  const app = await NestFactory.create(AppModule)

  // 🔍 DEBUG: Log environment variables (remove after debugging)
  logger.log(`📋 Raw ALLOWED_ORIGINS: "${process.env.ALLOWED_ORIGINS}"`)
  logger.log(`📋 NODE_ENV: "${process.env.NODE_ENV}"`)

  // ✅ Parse allowed origins from environment variable
  const frontendUrl = process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:5173'
  const allowedOrigins = frontendUrl.split(',').map(origin => origin.trim())

  logger.log(`🔍 Parsed allowed origins: ${JSON.stringify(allowedOrigins)}`)

  // ✅ PRODUCTION-READY CORS CONFIGURATION with dynamic origin function
  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, server-to-server)
      if (!origin) {
        logger.log('✅ Allowing request with no origin')
        return callback(null, true)
      }

      // Check if origin is in allowed list
      if (allowedOrigins.includes(origin)) {
        logger.log(`✅ Allowing origin: ${origin}`)
        callback(null, true)
      } else {
        logger.warn(`❌ Blocked by CORS: ${origin}`)
        logger.warn(`   Allowed origins: ${allowedOrigins.join(', ')}`)
        callback(new Error('Not allowed by CORS'))
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    optionsSuccessStatus: 200,
  })

  // Set global API prefix
  app.setGlobalPrefix('api')

  // Global validation pipe
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
    logger.log(`🌐 CORS enabled for origins:`)
    allowedOrigins.forEach(origin => logger.log(`   - ${origin}`))
    logger.log('═══════════════════════════════════════════════════')
  } catch (error) {
    logger.error('❌ Failed to start server:', error)
    process.exit(1)
  }
}

bootstrap()
