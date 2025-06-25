import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { Analytics, UserDashboardSettings } from './entities/analytics.entity';
import { UsersModule } from '../users/users.module';
import { HealthLogsModule } from '../health-logs/health-logs.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Analytics, UserDashboardSettings]),
    UsersModule,
    HealthLogsModule,
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}