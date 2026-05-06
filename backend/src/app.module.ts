import './config/env.loader';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';
import { AuthModule } from './modules/auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './modules/users/users.module';
import { PlansModule } from './modules/auth/plans/plans.module';
import { AdminModule } from './modules/admin/admin.module';

@Module({
  imports: [
    ConfigModule, 
    PrismaModule, 
    AuthModule, 
    UsersModule, 
    PlansModule, 
    AdminModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}


/*
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { PlansModule } from './modules/auth/plans/plans.module';



@Module({
  imports: [AuthModule, PlansModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

*/