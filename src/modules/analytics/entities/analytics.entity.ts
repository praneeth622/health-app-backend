import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn, Index } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum AnalyticsType {
  WEIGHT_TRACKING = 'weight_tracking',
  WORKOUT_SUMMARY = 'workout_summary',
  NUTRITION_ANALYSIS = 'nutrition_analysis',
  SLEEP_PATTERN = 'sleep_pattern',
  MOOD_TRACKING = 'mood_tracking',
  PROGRESS_MILESTONE = 'progress_milestone',
  CHALLENGE_PERFORMANCE = 'challenge_performance',
  SOCIAL_ENGAGEMENT = 'social_engagement'
}

export enum PeriodType {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly'
}

@Entity('analytics')
@Index(['user_id', 'type', 'period_type', 'period_start'])
export class Analytics {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: AnalyticsType })
  type: AnalyticsType;

  @Column({ type: 'enum', enum: PeriodType })
  period_type: PeriodType;

  @Column({ type: 'date' })
  period_start: Date;

  @Column({ type: 'date' })
  period_end: Date;

  @Column({ type: 'json' })
  metrics: Record<string, any>; // Flexible metrics storage

  @Column({ type: 'json', nullable: true })
  insights: Record<string, any>; // AI-generated insights

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  score: number; // Overall performance score

  @Column({ type: 'json', nullable: true })
  goals_progress: Record<string, any>; // Progress towards goals

  @Column({ type: 'json', nullable: true })
  comparisons: Record<string, any>; // Comparisons with previous periods

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'uuid' })
  user_id: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

@Entity('user_dashboard_settings')
export class UserDashboardSettings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'json' })
  widget_preferences: Record<string, any>; // Which widgets to show

  @Column({ type: 'json' })
  chart_preferences: Record<string, any>; // Chart types and settings

  @Column({ type: 'json' })
  notification_preferences: Record<string, any>; // Analytics notifications

  @Column({ type: 'varchar', length: 50, default: 'light' })
  theme: string;

  @Column({ type: 'varchar', length: 20, default: 'metric' })
  units_preference: string; // metric vs imperial

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'uuid' })
  user_id: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}