import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateHealthLogDto {
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
