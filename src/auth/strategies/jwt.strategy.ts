import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    const secret = configService.get<string>('JWT_SECRET')
    
    // ✅ Provide default if not set
    if (!secret) {
      console.warn('⚠️ JWT_SECRET not set, using default for development')
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret || 'default-secret-key-change-in-production',
    })
  }

  validate(payload: any) {
    return {
      id: payload.sub,
      email: payload.email,
    }
  }
}
