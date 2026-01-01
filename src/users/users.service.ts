import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { ObjectId } from 'mongodb';
import { User } from './user.entity';
import { CreateUserDto } from './dtos/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private repo: MongoRepository<User>,
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
  
}
