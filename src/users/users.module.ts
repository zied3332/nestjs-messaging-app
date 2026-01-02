import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './user.entity';

import { Message } from '../messages/message.entity'; // ✅ adjust path

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Message]), // ✅ IMPORTANT
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
