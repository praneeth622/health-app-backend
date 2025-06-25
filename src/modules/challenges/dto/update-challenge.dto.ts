import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ChallengeType, ChallengeDifficulty, ChallengeStatus } from '../entities/challenge.entity';

export class UpdateChallengeDto {
  @ApiPropertyOptional({
    description: 'Challenge title',
    example: '12,000 Steps Daily Challenge',
    minLength: 1,
    maxLength: 200,
  })
  title?: string;

  @ApiPropertyOptional({
    description: 'Detailed description of the challenge',
    example: 'Updated challenge to walk 12,000 steps daily for enhanced fitness goals.',
    minLength: 10,
    maxLength: 2000,
  })
  description?: string;

  @ApiPropertyOptional({
    description: 'Type of challenge',
    enum: ChallengeType,
    example: ChallengeType.STEPS,
  })
  type?: ChallengeType;

  @ApiPropertyOptional({
    description: 'Difficulty level of the challenge',
    enum: ChallengeDifficulty,
    example: ChallengeDifficulty.INTERMEDIATE,
  })
  difficulty?: ChallengeDifficulty;

  @ApiPropertyOptional({
    description: 'Challenge goal with target and unit',
    example: {
      target: 12000,
      unit: 'steps',
      daily_target: 12000,
      total_target: 360000
    },
  })
  goal?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Duration of the challenge in days',
    example: 45,
    minimum: 1,
    maximum: 365,
  })
  duration_days?: number;

  @ApiPropertyOptional({
    description: 'Start date of the challenge',
    example: '2025-07-15',
    format: 'date',
  })
  start_date?: Date;

  @ApiPropertyOptional({
    description: 'Current status of the challenge',
    enum: ChallengeStatus,
    example: ChallengeStatus.ACTIVE,
  })
  status?: ChallengeStatus;

  @ApiPropertyOptional({
    description: 'Whether the challenge is visible to all users',
    example: true,
  })
  is_public?: boolean;

  @ApiPropertyOptional({
    description: 'Maximum number of participants',
    example: 150,
    minimum: 0,
    maximum: 10000,
  })
  max_participants?: number;

  @ApiPropertyOptional({
    description: 'Rewards for completing the challenge',
    example: {
      points: 750,
      badges: ['Step Master Pro', 'Endurance Champion'],
      virtual_rewards: ['Gold Achievement Certificate']
    },
  })
  rewards?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Challenge-specific rules and guidelines',
    example: {
      minimum_daily_steps: 10000,
      rest_days_allowed: 3,
      tracking_method: 'health_app_sync',
      bonus_weekend_target: 15000
    },
  })
  rules?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'URL of the challenge image',
    example: 'https://example.com/images/advanced-step-challenge.jpg',
    format: 'url',
  })
  image_url?: string;
}

export class JoinChallengeDto {
  @ApiProperty({
    description: 'Challenge ID to join',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    format: 'uuid',
  })
  challengeId: string;

  @ApiProperty({
    description: 'User ID joining the challenge',
    example: 'user-uuid-here',
    format: 'uuid',
  })
  userId: string;
}

export class UpdateProgressDto {
  @ApiProperty({
    description: 'Challenge ID',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    format: 'uuid',
  })
  challengeId: string;

  @ApiProperty({
    description: 'User ID',
    example: 'user-uuid-here',
    format: 'uuid',
  })
  userId: string;

  @ApiProperty({
    description: 'Date of the progress entry',
    example: '2025-07-01',
    format: 'date',
  })
  date: Date;

  @ApiProperty({
    description: 'Progress data for the day',
    example: {
      steps: 12500,
      distance_km: 8.2,
      calories_burned: 420,
      active_minutes: 65
    },
  })
  progress_data: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Additional notes or achievements',
    example: {
      mood: 'energetic',
      weather: 'sunny',
      achievement: 'exceeded daily goal'
    },
  })
  notes?: Record<string, any>;
}
