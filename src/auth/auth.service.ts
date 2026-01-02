import { Injectable, BadRequestException } from '@nestjs/common';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async login(username: string) {
    username = (username || '').trim();
    if (!username) throw new BadRequestException('username is required');

    // ✅ if user exists -> return
    const all = await this.usersService.findAll();
    const existing = all.find(u => u.username === username);

    if (existing) {
      return { user: existing };
    }

    // ✅ create user automatically (simple for exam)
    const user = await this.usersService.create({ username });
    return { user };
  }
}
