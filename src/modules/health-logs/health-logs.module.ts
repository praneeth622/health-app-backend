import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthLogsService } from './health-logs.service';
import { HealthLogsController } from './health-logs.controller';
import { HealthLog } from './entities/health-log.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([HealthLog]),
    UsersModule,
  ],
  controllers: [HealthLogsController],
  providers: [HealthLogsService],
  exports: [HealthLogsService],
})
export class HealthLogsModule {}
