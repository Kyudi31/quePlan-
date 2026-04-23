import { defineConfig } from 'prisma/config';
import '../config/env.loader';
import { getPrismaDatabaseUrl } from '../config/app.config';

export default defineConfig({
  schema: './prisma/schema.prisma',
  migrations: {
    path: './prisma/migrations',
  },
  datasource: {
    url: getPrismaDatabaseUrl(),
  },
});
