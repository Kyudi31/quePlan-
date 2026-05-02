import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { PlansModule } from './modules/auth/plans/plans.module';
import { AdminModule } from './modules/admin/admin.module';

@Module({
  imports: [AuthModule, PlansModule, AdminModule],
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