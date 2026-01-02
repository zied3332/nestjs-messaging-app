import { Module } from '@nestjs/common';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService): JwtModuleOptions => {
        const secret = config.get<string>('JWT_SECRET') || 'dev_secret_change_me';

        // ✅ expiresIn can be '7d', '1h', etc. TypeScript may complain -> cast safely
        const expiresFromEnv = config.get<string>('JWT_EXPIRES_IN');
        const expiresIn =
          (expiresFromEnv && /^\d+$/.test(expiresFromEnv))
            ? Number(expiresFromEnv)                 // "3600" -> 3600 seconds
            : ((expiresFromEnv || '7d') as any);      // "7d" -> ok at runtime

        return {
          secret,
          signOptions: { expiresIn },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [JwtModule],
})
export class AuthModule {}
