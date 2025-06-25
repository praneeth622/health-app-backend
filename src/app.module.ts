import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RolesModule } from './modules/roles/roles.module';
import { UsersModule } from './modules/users/users.module';
import { GroupsModule } from './modules/groups/groups.module';
import { PostsModule } from './modules/posts/posts.module';
import { CommentsModule } from './modules/comments/comments.module';
import { HealthLogsModule } from './modules/health-logs/health-logs.module';
import { RemindersModule } from './modules/reminders/reminders.module';
import { ChallengesModule } from './modules/challenges/challenges.module';
import { MarketplaceItemsModule } from './modules/marketplace-items/marketplace-items.module';
import { envConfig, envValidation } from './config/env.config';
import { typeOrmConfig } from './config/typeorm.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      ...envConfig,
      load: [envValidation],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: typeOrmConfig,
      inject: [ConfigService],
    }),
    RolesModule,
    UsersModule,
    GroupsModule,
    PostsModule,
    CommentsModule,
    HealthLogsModule,
    RemindersModule,
    ChallengesModule,
    MarketplaceItemsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
