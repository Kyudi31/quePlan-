import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'node:crypto';
import { compare, hash } from 'bcrypt';
import { LoginAuthDto } from './dto/login-auth.dto';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(userObject: RegisterAuthDto) {
    const passwordHash = await hash(userObject.password, 10);
    const user = this.usersService.create({
      id: randomUUID(),
      email: userObject.email,
      passwordHash,
      name: userObject.name,
    });

    return this.buildAuthResponse(user);
  }

  async login(userObject: LoginAuthDto) {
    const user = this.usersService.findByEmail(userObject.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const isPasswordValid = await compare(userObject.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    return this.buildAuthResponse(user);
  }

  private async buildAuthResponse(user: User) {
    return {
      user: user.toPublicJSON(),
      accessToken: await this.jwtService.signAsync(user.toJwtPayload()),
    };
  }
}
