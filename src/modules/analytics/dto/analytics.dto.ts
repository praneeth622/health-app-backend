import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AnalyticsType, PeriodType } from '../entities/analytics.entity';

export class CreateAnalyticsDto {
  @ApiProperty({
    description: 'Type of analytics',
    enum: AnalyticsType,
    example: AnalyticsType.WEIGHT_TRACKING,
  })
  type: AnalyticsType;

  @ApiProperty({
    description: 'Period type for analytics',
    enum: PeriodType,
    example: PeriodType.WEEKLY,
  })
  period_type: PeriodType;

  @ApiProperty({
    description: 'Start date of the period',
    example: '2025-06-18',
    format: 'date',
  })
  period_start: Date;

  @ApiProperty({
    description: 'End date of the period',
    example: '2025-06-25',
    format: 'date',
  })
  period_end: Date;

  @ApiProperty({
    description: 'Metrics data',
    example: {
      average_weight: 70.5,
      weight_change: -1.2,
      measurements_count: 7,
      trend: 'decreasing'
    },
  })
  metrics: Record<string, any>;

  @ApiPropertyOptional({
    description: 'AI-generated insights',
    example: {
      summary: 'Great progress this week! You lost 1.2kg consistently.',
      recommendations: ['Continue current diet plan', 'Add 30min cardio'],
      achievements: ['Weekly weight loss goal achieved']
    },
  })
  insights?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Overall performance score (0-100)',
    example: 85.5,
    minimum: 0,
    maximum: 100,
  })
  score?: number;

  @ApiPropertyOptional({
    description: 'Progress towards goals',
    example: {
      weight_loss_goal: { target: 5, achieved: 1.2, percentage: 24 },
      workout_frequency: { target: 5, achieved: 4, percentage: 80 }
    },
  })
  goals_progress?: Record<string, any>;

  @ApiProperty({
    description: 'User ID',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    format: 'uuid',
  })
  user_id: string;
}

export class UpdateAnalyticsDto {
  @ApiPropertyOptional({
    description: 'Updated metrics data',
    example: {
      average_weight: 70.2,
      weight_change: -1.5,
      measurements_count: 8,
      trend: 'decreasing'
    },
  })
  metrics?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Updated insights',
    example: {
      summary: 'Excellent progress this week! You exceeded your weight loss goal.',
      recommendations: ['Maintain current routine', 'Consider strength training'],
      achievements: ['Weekly weight loss goal exceeded', 'Consistency streak: 7 days']
    },
  })
  insights?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Updated performance score',
    example: 92.0,
    minimum: 0,
    maximum: 100,
  })
  score?: number;

  @ApiPropertyOptional({
    description: 'Updated goals progress',
    example: {
      weight_loss_goal: { target: 5, achieved: 1.5, percentage: 30 },
      workout_frequency: { target: 5, achieved: 5, percentage: 100 }
    },
  })
  goals_progress?: Record<string, any>;
}

export class GetAnalyticsDto {
  @ApiProperty({
    description: 'Analytics ID',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    format: 'uuid',
  })
  id: string;
}

export class GetUserAnalyticsDto {
  @ApiProperty({
    description: 'User ID',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    format: 'uuid',
  })
  userId: string;
}

export class DashboardSummaryDto {
  @ApiProperty({
    description: 'User ID',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    format: 'uuid',
  })
  userId: string;

  @ApiPropertyOptional({
    description: 'Time period for summary',
    enum: PeriodType,
    example: PeriodType.WEEKLY,
  })
  period?: PeriodType;
}

export class CreateDashboardSettingsDto {
  @ApiProperty({
    description: 'Widget preferences',
    example: {
      weight_chart: { enabled: true, position: 1 },
      workout_summary: { enabled: true, position: 2 },
      goals_progress: { enabled: true, position: 3 },
      recent_activities: { enabled: false, position: 4 }
    },
  })
  widget_preferences: Record<string, any>;

  @ApiProperty({
    description: 'Chart preferences',
    example: {
      weight_chart_type: 'line',
      workout_chart_type: 'bar',
      show_trends: true,
      show_goals: true
    },
  })
  chart_preferences: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Notification preferences',
    example: {
      weekly_summary: true,
      goal_achievements: true,
      milestone_alerts: true,
      trend_insights: false
    },
  })
  notification_preferences?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Theme preference',
    example: 'dark',
    enum: ['light', 'dark', 'auto'],
  })
  theme?: string;

  @ApiPropertyOptional({
    description: 'Units preference',
    example: 'metric',
    enum: ['metric', 'imperial'],
  })
  units_preference?: string;

  @ApiProperty({
    description: 'User ID',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    format: 'uuid',
  })
  user_id: string;
}