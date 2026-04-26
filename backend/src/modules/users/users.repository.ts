import { User } from './user.entity';

export const USERS_REPOSITORY = Symbol('USERS_REPOSITORY');

export interface UsersRepository {
  findById(id: string): User | null;
  findByEmail(email: string): User | null;
  save(user: User): User;
}
