import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { ObjectId } from 'mongodb';
import { Message } from './message.entity';
import { CreateMessageDto } from './dtos/create-message.dto';
import { UpdateMessageDto } from './dtos/update-message.dto';
import { UsersService } from '../users/users.service';
import { MessagesGateway } from './messages.gateway';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private repo: MongoRepository<Message>,
    private usersService: UsersService,
  private gateway: MessagesGateway,
  ) {}

async create(dto: CreateMessageDto) {
  // validate user exists
  const user = await this.usersService.findOne(dto.userId);

  const msg = this.repo.create({
    content: dto.content,
    status: 'sent',
    userId: new ObjectId(dto.userId),
    date: new Date(),
  });

  const saved = await this.repo.save(msg);

  // ✅ broadcast to clients
  this.gateway.emitNewMessage({
    _id: saved._id,
    content: saved.content,
    status: saved.status,
    date: saved.date,
    user: { _id: user._id, username: user.username },
  });

  return saved;
}


  async findAll() {
    return await this.repo.find({ order: { date: 'DESC' as any } });
  }

  async findOne(id: string) {
    const msg = await this.repo.findOneBy({ _id: new ObjectId(id) } as any);
    if (!msg) throw new NotFoundException('Message not found');
    return msg;
  }

  async update(id: string, attrs: UpdateMessageDto) {
    const msg = await this.findOne(id);
    Object.assign(msg, attrs);
    return await this.repo.save(msg);
  }

  async remove(id: string) {
    const msg = await this.findOne(id);
    await this.repo.remove(msg);
    return { deleted: true };
  }

  async findAllWithUser() {
    return await this.repo.aggregate([
      { $sort: { date: -1 } },
      {
        $lookup: {
          from: 'user',            // collection name (often 'user' or 'users' in Mongo)
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          content: 1,
          status: 1,
          date: 1,
          userId: 1,
          user: { _id: 1, username: 1, createdAt: 1 },
        },
      },
    ]).toArray();
  }
}
