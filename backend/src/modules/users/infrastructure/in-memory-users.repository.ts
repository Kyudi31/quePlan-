import { Injectable } from '@nestjs/common';
import { User } from '../user.entity';
import { UsersRepository } from '../users.repository';

@Injectable()
export class InMemoryUsersRepository implements UsersRepository {
  private readonly users = new Map<string, User>();

  findById(id: string): User | null {
    return this.users.get(id) ?? null;
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

  save(user: User): User {
    this.users.set(user.id, user);
    return user;
  }
}
