import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReminderType, ReminderFrequency, ReminderStatus } from '../entities/reminder.entity';

export class UpdateReminderDto {
  @ApiPropertyOptional({
    description: 'Reminder title',
    example: 'Take Vitamin D3',
    minLength: 1,
    maxLength: 200,
  })
  title?: string;

  @ApiPropertyOptional({
    description: 'Detailed description of the reminder',
    example: 'Take 1000IU Vitamin D supplement with breakfast',
    maxLength: 1000,
  })
  description?: string;

  @ApiPropertyOptional({
    description: 'Type of reminder',
    enum: ReminderType,
    example: ReminderType.MEDICATION,
  })
  type?: ReminderType;

  @ApiPropertyOptional({
    description: 'Frequency of the reminder',
    enum: ReminderFrequency,
    example: ReminderFrequency.DAILY,
  })
  frequency?: ReminderFrequency;

  @ApiPropertyOptional({
    description: 'Time when reminder should trigger (24-hour format)',
    example: '09:00',
    pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$',
  })
  time?: string;

  @ApiPropertyOptional({
    description: 'Start date for the reminder',
    example: '2025-06-25',
    format: 'date',
  })
  start_date?: Date;

  @ApiPropertyOptional({
    description: 'End date for the reminder',
    example: '2025-12-31',
    format: 'date',
  })
  end_date?: Date;

  @ApiPropertyOptional({
    description: 'Custom scheduling pattern for complex frequencies',
    example: {
      days_of_week: [1, 3, 5],
      times_per_day: 3,
      interval_hours: 8
    },
  })
  custom_schedule?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Current status of the reminder',
    enum: ReminderStatus,
    example: ReminderStatus.ACTIVE,
  })
  status?: ReminderStatus;

  @ApiPropertyOptional({
    description: 'Whether push notifications are enabled',
    example: true,
  })
  is_notification_enabled?: boolean;

  @ApiPropertyOptional({
    description: 'Additional metadata specific to reminder type',
    example: {
      medication_name: 'Vitamin D3',
      dosage: '2000IU',
      instructions: 'Take with morning meal'
    },
  })
  metadata?: Record<string, any>;
}

export class UpdateReminderStatusDto {
  @ApiProperty({
    description: 'New status for the reminder',
    enum: ReminderStatus,
    example: ReminderStatus.COMPLETED,
  })
  status: ReminderStatus;
}
