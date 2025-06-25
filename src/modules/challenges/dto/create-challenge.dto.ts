import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ChallengeType, ChallengeDifficulty } from '../entities/challenge.entity';

export class CreateChallengeDto {
  @ApiProperty({
    description: 'Challenge title',
    example: '10,000 Steps Daily Challenge',
    minLength: 1,
    maxLength: 200,
  })
  title: string;

  @ApiProperty({
    description: 'Detailed description of the challenge',
    example: 'Walk 10,000 steps every day for 30 days to improve cardiovascular health and build a consistent exercise habit.',
    minLength: 10,
    maxLength: 2000,
  })
  description: string;

  @ApiProperty({
    description: 'Type of challenge',
    enum: ChallengeType,
    example: ChallengeType.STEPS,
  })
  type: ChallengeType;

  @ApiPropertyOptional({
    description: 'Difficulty level of the challenge',
    enum: ChallengeDifficulty,
    example: ChallengeDifficulty.BEGINNER,
    default: ChallengeDifficulty.BEGINNER,
  })
  difficulty?: ChallengeDifficulty;

  @ApiProperty({
    description: 'Challenge goal with target and unit',
    example: {
      target: 10000,
      unit: 'steps',
      daily_target: 10000,
      total_target: 300000
    },
  })
  goal: Record<string, any>;

  @ApiProperty({
    description: 'Duration of the challenge in days',
    example: 30,
    minimum: 1,
    maximum: 365,
  })
  duration_days: number;

  @ApiProperty({
    description: 'Start date of the challenge',
    example: '2025-07-01',
    format: 'date',
  })
  start_date: Date;

  @ApiPropertyOptional({
    description: 'Whether the challenge is visible to all users',
    example: true,
    default: false,
  })
  is_public?: boolean;

  @ApiPropertyOptional({
    description: 'Maximum number of participants (0 for unlimited)',
    example: 100,
    minimum: 0,
    maximum: 10000,
    default: 0,
  })
  max_participants?: number;

  @ApiPropertyOptional({
    description: 'Rewards for completing the challenge',
    example: {
      points: 500,
      badges: ['Step Master', 'Consistency Champion'],
      virtual_rewards: ['Achievement Certificate']
    },
  })
  rewards?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Challenge-specific rules and guidelines',
    example: {
      minimum_daily_steps: 8000,
      rest_days_allowed: 2,
      tracking_method: 'health_app_sync'
    },
  })
  rules?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'URL of the challenge image',
    example: 'https://example.com/images/step-challenge.jpg',
    format: 'url',
  })
  image_url?: string;

  @ApiProperty({
    description: 'ID of the user creating the challenge',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    format: 'uuid',
  })
  creator_id: string;
}
