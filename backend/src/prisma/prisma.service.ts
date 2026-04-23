import { Inject, Injectable, Logger, OnApplicationShutdown } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';
import { APP_CONFIG, DEFAULT_DATABASE_URL } from '../config/app.config';
import type { AppConfig } from '../config/app.config';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnApplicationShutdown
{
  private readonly logger = new Logger(PrismaService.name);
  private readonly shouldAutoConnect: boolean;
  private readonly hasDatabaseUrl: boolean;

  constructor(@Inject(APP_CONFIG) config: AppConfig) {
    const hasDatabaseUrl = Boolean(config.database.url);
    const connectionString = config.database.url ?? DEFAULT_DATABASE_URL;
    const adapter = new PrismaPg({ connectionString });

    super({
      adapter,
      log: config.app.environment === 'development' ? ['warn', 'error'] : ['error'],
    });

    this.shouldAutoConnect = config.database.autoConnect && hasDatabaseUrl;
    this.hasDatabaseUrl = hasDatabaseUrl;

    if (!hasDatabaseUrl) {
      this.logger.warn(
        `DATABASE_URL is not configured. Prisma is registered with the fallback connection string ${DEFAULT_DATABASE_URL}.`,
      );
    }
  }

  async connect() {
    if (!this.hasDatabaseUrl) {
      this.logger.warn(
        'Skipping Prisma connection because DATABASE_URL is not configured.',
      );
      return;
    }

    await this.$connect();
  }

  async connectIfEnabled() {
    if (!this.shouldAutoConnect) {
      return;
    }

    await this.connect();
  }

  async onApplicationShutdown() {
    await this.$disconnect();
  }
}
