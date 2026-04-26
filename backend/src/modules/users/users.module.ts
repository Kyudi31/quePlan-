import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { InMemoryUsersRepository } from './infrastructure/in-memory-users.repository';
import { USERS_REPOSITORY } from './users.repository';

@Module({
  controllers: [UsersController],
  providers: [
    UsersService,
    InMemoryUsersRepository,
    {
      provide: USERS_REPOSITORY,
      useExisting: InMemoryUsersRepository,
    },
  ],
  exports: [UsersService],
})
export class UsersModule {}
