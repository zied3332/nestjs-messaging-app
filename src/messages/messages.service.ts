import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { ObjectId } from 'mongodb';

import { Message } from './message.entity';
import { CreateMessageDto } from './dtos/create-message.dto';
import { UsersService } from '../users/users.service';
import { MessagesGateway } from './messages.gateway';

type MsgStatus = 'sent' | 'seen';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly repo: MongoRepository<Message>,
    private readonly usersService: UsersService,
    private readonly gateway: MessagesGateway,
  ) {}

  // ✅ Controller calls send() => keep this name
  async send(fromUserId: string, dto: CreateMessageDto): Promise<Message> {
    const fromUser = await this.usersService.findOne(fromUserId);
    const toUser = await this.usersService.findOne(dto.toUserId);

    // ⚠️ Don't force TypeScript to treat create() as Message (it may infer Message[])
    const msg = this.repo.create({
      fromUserId,
      toUserId: dto.toUserId,
      content: dto.content,
      status: 'sent',
      createdAt: new Date(),
    } as any);

    // ✅ Force saved as single Message
    const saved = (await this.repo.save(msg as any)) as unknown as Message;

    this.gateway.emitNewMessage({
      _id: (saved as any)._id,
      content: (saved as any).content,
      status: (saved as any).status,
      createdAt: (saved as any).createdAt,
      fromUserId: (saved as any).fromUserId,
      toUserId: (saved as any).toUserId,
      fromUser: { _id: fromUser._id, username: fromUser.username },
      toUser: { _id: toUser._id, username: toUser.username },
    });

    return saved;
  }

  async getConversation(meId: string, otherUserId: string) {
    await this.usersService.findOne(otherUserId);

    const messages = await this.repo.find({
      where: {
        $or: [
          { fromUserId: meId, toUserId: otherUserId },
          { fromUserId: otherUserId, toUserId: meId },
        ],
      } as any,
      order: { createdAt: 'ASC' as any },
    });

    const me = await this.usersService.findOne(meId);
    const other = await this.usersService.findOne(otherUserId);

    return (messages as any[]).map((m) => ({
      ...m,
      fromUser:
        m.fromUserId === meId
          ? { _id: me._id, username: me.username }
          : { _id: other._id, username: other.username },
      toUser:
        m.toUserId === meId
          ? { _id: me._id, username: me.username }
          : { _id: other._id, username: other.username },
    }));
  }

  async findOne(id: string): Promise<Message> {
    const msg = await this.repo.findOneBy({ _id: new ObjectId(id) } as any);
    if (!msg) throw new NotFoundException('Message not found');
    return msg as any;
  }

  async updateStatus(meId: string, id: string, status: MsgStatus): Promise<Message> {
    const msg: any = await this.findOne(id);

    if (msg.fromUserId !== meId && msg.toUserId !== meId) {
      throw new ForbiddenException('Not allowed');
    }
    if (status !== 'sent' && status !== 'seen') {
      throw new ForbiddenException('Invalid status');
    }

    msg.status = status;
    const saved = (await this.repo.save(msg as any)) as unknown as Message;

    this.gateway.emitMessageUpdated({
      _id: (saved as any)._id,
      status: (saved as any).status,
      content: (saved as any).content,
      createdAt: (saved as any).createdAt,
      fromUserId: (saved as any).fromUserId,
      toUserId: (saved as any).toUserId,
    });

    return saved;
  }

  async deleteMessage(meId: string, id: string) {
    const msg: any = await this.findOne(id);

    if (msg.fromUserId !== meId) {
      throw new ForbiddenException('Only sender can delete');
    }

    await this.repo.delete({ _id: new ObjectId(id) } as any);
    this.gateway.emitMessageDeleted({ id });

    return { deleted: true };
  }
}
