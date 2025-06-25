import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationType, NotificationPriority, DeliveryChannel } from '../entities/notification.entity';

export class CreateNotificationDto {
  @ApiProperty({
    description: 'Notification title',
    example: 'Workout Reminder',
    maxLength: 200,
  })
  title: string;

  @ApiProperty({
    description: 'Notification message',
    example: 'Time for your evening workout! Don\'t break your streak 💪',
  })
  message: string;

  @ApiProperty({
    description: 'Type of notification',
    enum: NotificationType,
    example: NotificationType.REMINDER,
  })
  type: NotificationType;

  @ApiPropertyOptional({
    description: 'Notification priority',
    enum: NotificationPriority,
    example: NotificationPriority.MEDIUM,
    default: NotificationPriority.MEDIUM,
  })
  priority?: NotificationPriority;

  @ApiPropertyOptional({
    description: 'Additional data payload',
    example: {
      workout_id: 'workout-uuid',
      exercise_type: 'cardio',
      duration_minutes: 30
    },
  })
  data?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Action URL or deep link',
    example: '/app/workouts/start?id=workout-uuid',
    maxLength: 500,
  })
  action_url?: string;

  @ApiPropertyOptional({
    description: 'Action button text',
    example: 'Start Workout',
    maxLength: 200,
  })
  action_text?: string;

  @ApiPropertyOptional({
    description: 'Image URL for notification',
    example: 'https://example.com/workout-motivation.jpg',
    maxLength: 500,
  })
  image_url?: string;

  @ApiPropertyOptional({
    description: 'Category for grouping notifications',
    example: 'workouts',
    maxLength: 100,
  })
  category?: string;

  @ApiPropertyOptional({
    description: 'Schedule notification for later',
    example: '2025-06-25T18:00:00.000Z',
    format: 'date-time',
  })
  scheduled_for?: Date;

  @ApiProperty({
    description: 'Target user ID',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    format: 'uuid',
  })
  user_id: string;

  @ApiPropertyOptional({
    description: 'User who triggered this notification',
    example: 'friend-user-uuid',
    format: 'uuid',
  })
  triggered_by_user_id?: string;
}

export class UpdateNotificationDto {
  @ApiPropertyOptional({
    description: 'Mark notification as read',
    example: true,
  })
  mark_as_read?: boolean;

  @ApiPropertyOptional({
    description: 'Mark notification as clicked',
    example: true,
  })
  mark_as_clicked?: boolean;

  @ApiPropertyOptional({
    description: 'Update notification data',
    example: { updated_field: 'new_value' },
  })
  data?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Activate or deactivate notification',
    example: false,
  })
  is_active?: boolean;
}

export class CreateNotificationPreferenceDto {
  @ApiProperty({
    description: 'Type of notification to configure',
    enum: NotificationType,
    example: NotificationType.REMINDER,
  })
  notification_type: NotificationType;

  @ApiProperty({
    description: 'Delivery channel for this notification type',
    enum: DeliveryChannel,
    example: DeliveryChannel.PUSH,
  })
  delivery_channel: DeliveryChannel;

  @ApiPropertyOptional({
    description: 'Enable or disable this notification type',
    example: true,
    default: true,
  })
  is_enabled?: boolean;

  @ApiPropertyOptional({
    description: 'Channel-specific settings',
    example: {
      sound: 'default',
      vibration: true,
      quiet_hours: { start: '22:00', end: '08:00' }
    },
  })
  settings?: Record<string, any>;

  @ApiProperty({
    description: 'User ID',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    format: 'uuid',
  })
  user_id: string;
}

export class BulkNotificationDto {
  @ApiProperty({
    description: 'List of user IDs to send notification to',
    example: ['user-uuid-1', 'user-uuid-2', 'user-uuid-3'],
    type: [String],
  })
  user_ids: string[];

  @ApiProperty({
    description: 'Notification title',
    example: 'New Challenge Available!',
  })
  title: string;

  @ApiProperty({
    description: 'Notification message',
    example: 'Join the "Summer Fitness Challenge" and compete with friends!',
  })
  message: string;

  @ApiProperty({
    description: 'Notification type',
    enum: NotificationType,
    example: NotificationType.CHALLENGE_INVITE,
  })
  type: NotificationType;

  @ApiPropertyOptional({
    description: 'Additional data',
    example: { challenge_id: 'challenge-uuid' },
  })
  data?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Action URL',
    example: '/app/challenges/join?id=challenge-uuid',
  })
  action_url?: string;

  @ApiPropertyOptional({
    description: 'User who triggered this notification',
    example: 'admin-user-uuid',
    format: 'uuid',
  })
  triggered_by_user_id?: string;
}

export class GetNotificationDto {
  @ApiProperty({
    description: 'Notification ID',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    format: 'uuid',
  })
  id: string;
}

export class GetUserNotificationsDto {
  @ApiProperty({
    description: 'User ID',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    format: 'uuid',
  })
  userId: string;
}