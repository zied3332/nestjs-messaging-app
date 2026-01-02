import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dtos/create-message.dto';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('messages')
@UseGuards(AuthGuard('jwt'))
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  send(@CurrentUser() user: any, @Body() dto: CreateMessageDto) {
    return this.messagesService.send(user.id, dto);
  }

  @Get('with/:userId')
  getConversation(@CurrentUser() user: any, @Param('userId') otherUserId: string) {
    return this.messagesService.getConversation(user.id, otherUserId);
  }

  @Patch(':id')
  update(@CurrentUser() user: any, @Param('id') id: string, @Body() body: { status: 'sent' | 'seen' }) {
    return this.messagesService.updateStatus(user.id, id, body.status);
  }

  @Delete(':id')
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.messagesService.deleteMessage(user.id, id);
  }
}
