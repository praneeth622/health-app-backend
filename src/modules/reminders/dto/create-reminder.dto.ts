import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReminderType, ReminderFrequency } from '../entities/reminder.entity';

export class CreateReminderDto {
  @ApiProperty({
    description: 'Reminder title',
    example: 'Take Vitamin D',
    minLength: 1,
    maxLength: 200,
  })
  title: string;

  @ApiPropertyOptional({
    description: 'Detailed description of the reminder',
    example: 'Take 1000IU Vitamin D supplement with breakfast',
    maxLength: 1000,
  })
  description?: string;

  @ApiProperty({
    description: 'Type of reminder',
    enum: ReminderType,
    example: ReminderType.MEDICATION,
  })
  type: ReminderType;

  @ApiProperty({
    description: 'Frequency of the reminder',
    enum: ReminderFrequency,
    example: ReminderFrequency.DAILY,
  })
  frequency: ReminderFrequency;

  @ApiProperty({
    description: 'Time when reminder should trigger (24-hour format)',
    example: '08:30',
    pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$',
  })
  time: string;

  @ApiPropertyOptional({
    description: 'Start date for the reminder',
    example: '2025-06-25',
    format: 'date',
  })
  start_date?: Date;

  @ApiPropertyOptional({
    description: 'End date for the reminder (optional for ongoing reminders)',
    example: '2025-12-31',
    format: 'date',
  })
  end_date?: Date;

  @ApiPropertyOptional({
    description: 'Custom scheduling pattern for complex frequencies',
    example: {
      days_of_week: [1, 3, 5], // Monday, Wednesday, Friday
      times_per_day: 2,
      interval_hours: 12
    },
  })
  custom_schedule?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Whether push notifications are enabled',
    example: true,
    default: true,
  })
  is_notification_enabled?: boolean;

  @ApiPropertyOptional({
    description: 'Additional metadata specific to reminder type',
    example: {
      medication_name: 'Vitamin D3',
      dosage: '1000IU',
      instructions: 'Take with food'
    },
  })
  metadata?: Record<string, any>;

  @ApiProperty({
    description: 'ID of the user who owns this reminder',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    format: 'uuid',
  })
  user_id: string;
}
