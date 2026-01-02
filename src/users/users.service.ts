import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { ObjectId } from 'mongodb';

import { User } from './user.entity';
import { CreateUserDto } from './dtos/create-user.dto';
import { Message } from '../messages/message.entity'; // ✅ adjust path if needed

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly repo: MongoRepository<User>,

    // ✅ Inject messages repository so getMessagesOfUser works
    @InjectRepository(Message)
    private readonly messagesRepo: MongoRepository<Message>,
  ) {}

  async create(dto: CreateUserDto) {
    const existing = await this.repo.findOneBy({ username: dto.username } as any);
    if (existing) throw new ConflictException('Username already exists');

    const user = this.repo.create({ username: dto.username });
    return await this.repo.save(user);
  }

  async findAll() {
    return await this.repo.find({ order: { createdAt: 'DESC' as any } });
  }

  async findOne(id: string) {
    const user = await this.repo.findOneBy({ _id: new ObjectId(id) } as any);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async remove(id: string) {
    const user = await this.findOne(id);
    await this.repo.remove(user);
    return { deleted: true };
  }

  // ✅ GET /users/:id/messages
  async getMessagesOfUser(userId: string) {
    // ensure user exists (nice for exam)
    await this.findOne(userId);

    const oid = new ObjectId(userId);

    // ✅ Aggregation to return messages + joined user object
    const pipeline: any[] = [
      { $match: { userId: oid } },  // ✅ Message must contain userId:ObjectId
      { $sort: { date: -1 } },
      {
        $lookup: {
          from: 'users',           // ✅ collection name (often "users")
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
    ];

    return this.messagesRepo.aggregate(pipeline).toArray();
  }
}
