import { config } from 'dotenv';
import { defineConfig } from 'prisma/config';

config({ path: ['.env', '../.env'] });

const databaseUrl =
  process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/qplan';

export default defineConfig({
  schema: './prisma/schema.prisma',
  migrations: {
    path: './prisma/migrations',
  },
  datasource: {
    url: databaseUrl,
  },
});
