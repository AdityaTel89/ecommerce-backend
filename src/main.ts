import { NestFactory } from '@nestjs/core'
import { ValidationPipe, Logger } from '@nestjs/common'
import { AppModule } from './app.module'
import * as helmet from 'helmet'
import * as compression from 'compression'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const logger = new Logger('Bootstrap')

  // ✅ Security middleware
  app.use(helmet())
  app.use(compression())

  // ✅ Enhanced CORS configuration
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

  // ✅ Global prefix for all routes
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

  // ✅ Error handling
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
    logger.log(`🔐 Security: Helmet + Compression Enabled`)
    logger.log('═══════════════════════════════════════════════════')
  } catch (error) {
    logger.error('❌ Failed to start application:', error)
    process.exit(1)
  }
}

bootstrap()
