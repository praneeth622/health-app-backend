import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const typeOrmConfig = (configService: ConfigService): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: configService.get('DB_HOST'),
  port: configService.get<number>('DB_PORT'),
  username: configService.get('DB_USER'),
  password: configService.get('DB_PASS'),
  database: configService.get('DB_NAME'),
  entities: [__dirname + '/../**/*.entity.{ts,js}'],
  synchronize: configService.get('NODE_ENV') !== 'production', // ⚠️ Turn off in production
  logging: configService.get('NODE_ENV') === 'development',
  ssl: configService.get('NODE_ENV') === 'production' ? {
    rejectUnauthorized: false,
  } : false,
  // Add connection pooling for production
  extra: {
    max: 20,
    min: 5,
    acquire: 30000,
    idle: 10000,
  },
});
