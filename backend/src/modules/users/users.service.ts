import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserProps, User } from './user.entity';

@Injectable()
export class UsersService {
  private readonly users = new Map<string, User>();

  create(input: Omit<CreateUserProps, 'id'> & { id: string }): User {
    const normalizedEmail = input.email.trim().toLowerCase();
    const existingUser = this.findByEmail(normalizedEmail);

    if (existingUser) {
      throw new ConflictException('Email is already registered.');
    }

    const user = User.create({
      ...input,
      email: normalizedEmail,
    });

    this.users.set(user.id, user);
    return user;
  }

  findById(id: string): User {
    const user = this.users.get(id);

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    return user;
  }

  findByEmail(email: string): User | null {
    const normalizedEmail = email.trim().toLowerCase();

    for (const user of this.users.values()) {
      if (user.email === normalizedEmail) {
        return user;
      }
    }

    return null;
  }

  updateProfile(id: string, updates: { name?: string }): User {
    const currentUser = this.findById(id);
    const updatedUser = currentUser.updateProfile(updates);
    this.users.set(updatedUser.id, updatedUser);
    return updatedUser;
  }
}
