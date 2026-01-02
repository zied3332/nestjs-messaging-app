import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  private toSafeUser(user: any) {
    const { passwordHash, ...safe } = user;
    return safe;
  }

  async register(username: string, password: string) {
    username = (username || '').trim();
    if (!username || !password) throw new BadRequestException('username and password are required');

    const existing = await this.usersService.findByUsername(username);
    if (existing) throw new BadRequestException('username already exists');

    const passwordHash = await bcrypt.hash(password, 10);
    const created = await this.usersService.createUser({ username, passwordHash });

    const safeUser = this.toSafeUser(created);
    const access_token = await this.jwtService.signAsync({
      sub: safeUser._id,
      username: safeUser.username,
    });

    return { access_token, user: safeUser };
  }

  async login(username: string, password: string) {
    username = (username || '').trim();
    if (!username || !password) throw new BadRequestException('username and password are required');

    const user = await this.usersService.findByUsername(username);
    if (!user) throw new UnauthorizedException('invalid credentials');

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('invalid credentials');

    const safeUser = this.toSafeUser(user);
    const access_token = await this.jwtService.signAsync({
      sub: safeUser._id,
      username: safeUser.username,
    });

    return { access_token, user: safeUser };
  }
}
