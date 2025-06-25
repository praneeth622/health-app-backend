import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { 
  CreateHealthLogDto as CreateHealthLogSchema, 
  UpdateHealthLogDto as UpdateHealthLogSchema, 
  GetHealthLogByIdDto as GetHealthLogByIdSchema,
  GetHealthLogsByUserDto as GetHealthLogsByUserSchema,
  GetHealthLogsByDateRangeDto as GetHealthLogsByDateRangeSchema
} from './health-log.zod';

export class CreateHealthLogDto implements CreateHealthLogSchema {
  @ApiProperty({
    description: 'User ID who owns this health log',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    format: 'uuid',
  })
  user_id: string;

  @ApiProperty({
    description: 'Date of the health log entry',
    example: '2025-06-25',
    format: 'date',
    pattern: '^\\d{4}-\\d{2}-\\d{2}$',
  })
  date: Date;

  @ApiPropertyOptional({
    description: 'Daily calorie intake',
    example: 2000,
    minimum: 0,
    maximum: 10000,
  })
  calories?: number;

  @ApiPropertyOptional({
    description: 'Daily step count',
    example: 8500,
    minimum: 0,
    maximum: 100000,
  })
  steps?: number;

  @ApiPropertyOptional({
    description: 'Daily water intake in milliliters',
    example: 2500,
    minimum: 0,
    maximum: 10000,
  })
  hydration_ml?: number;

  @ApiPropertyOptional({
    description: 'Hours of sleep',
    example: 7.5,
    minimum: 0,
    maximum: 24,
  })
  sleep_hours?: number;

  @ApiPropertyOptional({
    description: 'Summary of vitamins and supplements taken',
    example: 'Vitamin D3 1000IU, Omega-3, Multivitamin',
    maxLength: 500,
  })
  vitamin_summary?: string;

  @ApiPropertyOptional({
    description: 'Additional health metrics (weight, blood pressure, etc.)',
    example: {
      weight_kg: 70.5,
      blood_pressure: '120/80',
      heart_rate: 72,
      mood: 'good'
    },
  })
  additional_metrics?: Record<string, any>;
}

export class UpdateHealthLogDto implements UpdateHealthLogSchema {
  @ApiPropertyOptional({
    description: 'Date of the health log entry',
    example: '2025-06-25',
    format: 'date',
    pattern: '^\\d{4}-\\d{2}-\\d{2}$',
  })
  date?: Date;

  @ApiPropertyOptional({
    description: 'Daily calorie intake',
    example: 2000,
    minimum: 0,
    maximum: 10000,
  })
  calories?: number;

  @ApiPropertyOptional({
    description: 'Daily step count',
    example: 8500,
    minimum: 0,
    maximum: 100000,
  })
  steps?: number;

  @ApiPropertyOptional({
    description: 'Daily water intake in milliliters',
    example: 2500,
    minimum: 0,
    maximum: 10000,
  })
  hydration_ml?: number;

  @ApiPropertyOptional({
    description: 'Hours of sleep',
    example: 7.5,
    minimum: 0,
    maximum: 24,
  })
  sleep_hours?: number;

  @ApiPropertyOptional({
    description: 'Summary of vitamins and supplements taken',
    example: 'Vitamin D3 1000IU, Omega-3, Multivitamin',
    maxLength: 500,
  })
  vitamin_summary?: string;

  @ApiPropertyOptional({
    description: 'Additional health metrics',
    example: {
      weight_kg: 70.5,
      blood_pressure: '120/80',
      heart_rate: 72,
      mood: 'good'
    },
  })
  additional_metrics?: Record<string, any>;
}

export class GetHealthLogByIdDto implements GetHealthLogByIdSchema {
  @ApiProperty({
    description: 'Health log ID',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    format: 'uuid',
  })
  id: string;
}

export class GetHealthLogsByUserDto implements GetHealthLogsByUserSchema {
  @ApiProperty({
    description: 'User ID',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    format: 'uuid',
  })
  userId: string;
}

export class GetHealthLogsByDateRangeDto implements GetHealthLogsByDateRangeSchema {
  @ApiProperty({
    description: 'User ID',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    format: 'uuid',
  })
  userId: string;

  @ApiProperty({
    description: 'Start date for range query',
    example: '2025-06-01',
    format: 'date',
    pattern: '^\\d{4}-\\d{2}-\\d{2}$',
  })
  startDate: string;

  @ApiProperty({
    description: 'End date for range query',
    example: '2025-06-30',
    format: 'date',
    pattern: '^\\d{4}-\\d{2}-\\d{2}$',
  })
  endDate: string;
}

export class HealthLogResponseDto {
  @ApiProperty({
    description: 'Health log unique identifier',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  id: string;

  @ApiProperty({
    description: 'User ID who owns this health log',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  user_id: string;

  @ApiProperty({
    description: 'Date of the health log entry',
    example: '2025-06-25',
  })
  date: string;

  @ApiPropertyOptional({
    description: 'Daily calorie intake',
    example: 2000,
  })
  calories?: number;

  @ApiPropertyOptional({
    description: 'Daily step count',
    example: 8500,
  })
  steps?: number;

  @ApiPropertyOptional({
    description: 'Daily water intake in milliliters',
    example: 2500,
  })
  hydration_ml?: number;

  @ApiPropertyOptional({
    description: 'Hours of sleep',
    example: 7.5,
  })
  sleep_hours?: number;

  @ApiPropertyOptional({
    description: 'Summary of vitamins and supplements taken',
    example: 'Vitamin D3 1000IU, Omega-3, Multivitamin',
  })
  vitamin_summary?: string;

  @ApiPropertyOptional({
    description: 'Additional health metrics',
    example: {
      weight_kg: 70.5,
      blood_pressure: '120/80',
      heart_rate: 72,
      mood: 'good'
    },
  })
  additional_metrics?: Record<string, any>;

  @ApiProperty({
    description: 'User information',
    required: false,
  })
  user?: {
    id: string;
    name: string;
    email: string;
  };

  @ApiProperty({
    description: 'Record creation timestamp',
    example: '2025-06-25T12:00:00.000Z',
  })
  created_at: Date;
}

export class HealthLogStatsResponseDto {
  @ApiProperty({
    description: 'Average daily calories',
    example: 2150.5,
  })
  avg_calories: number;

  @ApiProperty({
    description: 'Average daily steps',
    example: 8750.2,
  })
  avg_steps: number;

  @ApiProperty({
    description: 'Average daily hydration in ml',
    example: 2400.8,
  })
  avg_hydration_ml: number;

  @ApiProperty({
    description: 'Average sleep hours',
    example: 7.3,
  })
  avg_sleep_hours: number;

  @ApiProperty({
    description: 'Total number of log entries',
    example: 30,
  })
  total_entries: number;

  @ApiProperty({
    description: 'Date range for the statistics',
    example: {
      start_date: '2025-06-01',
      end_date: '2025-06-30'
    },
  })
  date_range: {
    start_date: string;
    end_date: string;
  };
}

export class PaginatedHealthLogsResponseDto {
  @ApiProperty({
    description: 'Array of health log entries',
    type: [HealthLogResponseDto],
  })
  health_logs: HealthLogResponseDto[];

  @ApiProperty({
    description: 'Total number of entries',
    example: 45,
  })
  total: number;

  @ApiProperty({
    description: 'Current page number',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Number of entries per page',
    example: 20,
  })
  limit: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 3,
  })
  total_pages: number;
}