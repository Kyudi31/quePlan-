import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

export const AUTH_PRISMA = 'AUTH_PRISMA';

type AuthPrismaClient = {
  user: {
    create: (args: {
      data: { email: string; password: string };
    }) => Promise<{ id: string }>;
    findUnique: (args: {
      where: { email: string };
    }) => Promise<{ id: string; email: string; password: string } | null>;
  };
};

@Injectable()
export class AuthService {
  constructor(
    @Inject(AUTH_PRISMA) private readonly prisma: AuthPrismaClient,
    private jwtService: JwtService,
  ) {}

  async register(data: { email: string; password: string }) {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
      },
    });

    return { message: 'User created', userId: user.id };
  }

  async login(data: { email: string; password: string }) {
    const user = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isMatch = await bcrypt.compare(data.password, user.password);

    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    const payload = { sub: user.id, email: user.email };

    const token = await this.jwtService.signAsync(payload);

    return { access_token: token };
  }
}
