import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './db/schema.ts',
  out: './db/migrations',
  dialect: 'sqlite', // using sqlite for preview environment instead of MySQL
  dbCredentials: {
    url: 'sqlite.db',
  },
});
