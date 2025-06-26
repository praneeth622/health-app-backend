import { ConfigModuleOptions } from '@nestjs/config';

export const envConfig: ConfigModuleOptions = {
  isGlobal: true,
  envFilePath: '.env',
};

export const envValidation = () => ({
  // Fix environment variable names to match TypeORM config
  DB_HOST: process.env.DATABASE_HOST || process.env.DB_HOST || 'localhost',
  DB_PORT: parseInt(process.env.DATABASE_PORT || process.env.DB_PORT || '5432') || 5432,
  DB_USER: process.env.DATABASE_USERNAME || process.env.DB_USER || 'postgres',
  DB_PASS: process.env.DATABASE_PASSWORD || process.env.DB_PASS || 'password',
  DB_NAME: process.env.DATABASE_NAME || process.env.DB_NAME || 'health_app',
  PORT: parseInt(process.env.PORT || '3000') || 3000,
});