import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { typeOrmConfig } from './config/typeorm.config';
import { envConfig } from './config/env.config';

// Import your existing modules
import { UsersModule } from './modules/users/users.module';
import { GroupsModule } from './modules/groups/groups.module';
import { HealthLogsModule } from './modules/health-logs/health-logs.module';
import { ChallengesModule } from './modules/challenges/challenges.module';
import { PostsModule } from './modules/posts/posts.module';
import { CommentsModule } from './modules/comments/comments.module';
import { RemindersModule } from './modules/reminders/reminders.module';
import { MarketplaceItemsModule } from './modules/marketplace-items/marketplace-items.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { NotificationsModule } from './modules/notifications/notifications.module';

// 🔧 Add the new auth module
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot(envConfig),
    TypeOrmModule.forRootAsync({
      useFactory: typeOrmConfig,
      inject: [ConfigService],
    }),
    // 🔧 Add AuthModule
    AuthModule,
    // Your existing modules
    UsersModule,
    GroupsModule,
    HealthLogsModule,
    ChallengesModule,
    PostsModule,
    CommentsModule,
    RemindersModule,
    MarketplaceItemsModule,
    AnalyticsModule,
    AnalyticsModule,
    NotificationsModule,
  ],
  providers: [AppService],
})
export class AppModule {}
