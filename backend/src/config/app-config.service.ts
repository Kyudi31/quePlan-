import { Inject, Injectable } from '@nestjs/common';
import { APP_CONFIG } from './app.config';
import type { AppConfig } from './app.config';

@Injectable()
export class AppConfigService {
  constructor(@Inject(APP_CONFIG) private readonly config: AppConfig) {}

  get app() {
    return this.config.app;
  }

  get swagger() {
    return this.config.swagger;
  }

  get validation() {
    return this.config.validation;
  }

  get database() {
    return this.config.database;
  }

  get auth() {
    return this.config.auth;
  }

  isProduction() {
    return this.config.app.environment === 'production';
  }

  isDatabaseConfigured() {
    return Boolean(this.config.database.url);
  }
}
