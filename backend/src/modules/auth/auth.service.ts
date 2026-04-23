import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'node:crypto';
import { hash } from 'bcrypt';
import { LoginAuthDto } from './dto/login-auth.dto';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { User } from '../users/user.schema';

export const AUTH_PRISMA = 'AUTH_PRISMA';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async register(userObject: RegisterAuthDto) {
    const passwordHash = await hash(userObject.password, 10);
    const user = User.create({
      id: randomUUID(),
      email: userObject.email,
      passwordHash,
      fullName: userObject.name,
    });

    return {
      user: user.toPublicJSON(),
      accessToken: await this.jwtService.signAsync(user.toJwtPayload()),
    };
  }

  async login(userObject: LoginAuthDto) {
    throw new UnauthorizedException(
      `Login requires a user lookup implementation. Pending lookup for ${userObject.email}.`,
    );
  }
}
