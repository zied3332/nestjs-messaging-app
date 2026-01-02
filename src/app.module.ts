import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { MessagesModule } from './messages/messages.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

import { Message } from './messages/message.entity';
import { User } from './users/user.entity';

import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    // ✅ Load .env globally (JWT_SECRET, JWT_EXPIRES_IN, etc.)
    ConfigModule.forRoot({ isGlobal: true }),

    // ✅ Serve your frontend from /public
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),

    // ✅ MongoDB (TypeORM)
    TypeOrmModule.forRoot({
      type: 'mongodb',
      host: 'localhost',
      port: 27017,
      database: 'messaging_db',
      entities: [Message, User],
      synchronize: true,
       // optional but good with mongodb driver
    }),

    // ✅ App modules
    MessagesModule,
    UsersModule,
    AuthModule,
  ],
})
export class AppModule {}
