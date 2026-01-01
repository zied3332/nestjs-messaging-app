import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessagesModule } from './messages/messages.module';
import { UsersModule } from './users/users.module';
import { Message } from './messages/message.entity';
import { User } from './users/user.entity';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
imports: [
  ServeStaticModule.forRoot({
    rootPath: join(__dirname, '..', 'public'),
  }),

  TypeOrmModule.forRoot({
    type: 'mongodb',
    host: 'localhost',
    port: 27017,
    database: 'messaging_db',
    entities: [Message, User],
    synchronize: true,
  }),

  MessagesModule,
  UsersModule,
],

})
export class AppModule {}
