import { Global, Module } from '@nestjs/common';
import { APP_CONFIG, createAppConfig } from './app.config';
import { AppConfigService } from './app-config.service';

@Global()
@Module({
  providers: [
    {
      provide: APP_CONFIG,
      useFactory: createAppConfig,
    },
    AppConfigService,
  ],
  exports: [APP_CONFIG, AppConfigService],
})
export class ConfigModule {}
