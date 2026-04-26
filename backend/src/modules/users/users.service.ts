import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserProps, User } from './user.entity';
import { USERS_REPOSITORY } from './users.repository';
import type { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(
    @Inject(USERS_REPOSITORY)
    private readonly usersRepository: UsersRepository,
  ) {}

  create(input: Omit<CreateUserProps, 'id'> & { id: string }): User {
    const normalizedEmail = input.email.trim().toLowerCase();
    const existingUser = this.usersRepository.findByEmail(normalizedEmail);

    if (existingUser) {
      throw new ConflictException('Email is already registered.');
    }

    const user = User.create({
      ...input,
      email: normalizedEmail,
    });

    return this.usersRepository.save(user);
  }

  findById(id: string): User {
    const user = this.usersRepository.findById(id);

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    return user;
  }

  findByEmail(email: string): User | null {
    return this.usersRepository.findByEmail(email);
  }

  updateProfile(id: string, updates: { name?: string }): User {
    const currentUser = this.findById(id);
    const updatedUser = currentUser.updateProfile(updates);
    return this.usersRepository.save(updatedUser);
  }
}
