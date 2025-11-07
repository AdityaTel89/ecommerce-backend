import { NestFactory } from '@nestjs/core'
import { ValidationPipe, Logger } from '@nestjs/common'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const logger = new Logger('Bootstrap')

  // ✅ CORS configuration
  const corsOrigin = process.env.CORS_ORIGIN || process.env.FRONTEND_URL || 'http://localhost:3000'
  
  app.enableCors({
    origin: corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    optionsSuccessStatus: 200,
    maxAge: 3600,
  })

  // ✅ Global prefix
  const apiPrefix = process.env.API_PREFIX || 'api'
  app.setGlobalPrefix(apiPrefix)

  // ✅ Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  )

  // ✅ Start server
  const port = process.env.PORT || 3001
  const nodeEnv = process.env.NODE_ENV || 'development'

  try {
    await app.listen(port, '0.0.0.0')
    
    logger.log('═══════════════════════════════════════════════════')
    logger.log(`✅ Application Successfully Started`)
    logger.log('═══════════════════════════════════════════════════')
    logger.log(`🌍 Environment: ${nodeEnv.toUpperCase()}`)
    logger.log(`🔗 URL: http://localhost:${port}`)
    logger.log(`📡 API Prefix: /${apiPrefix}`)
    logger.log(`🌐 CORS Origin: ${corsOrigin}`)
    logger.log('═══════════════════════════════════════════════════')
  } catch (error) {
    logger.error('❌ Failed to start application:', error)
    process.exit(1)
  }
}

bootstrap()
