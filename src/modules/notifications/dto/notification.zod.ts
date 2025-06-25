import { z } from 'zod';
import { NotificationType, NotificationPriority, DeliveryChannel } from '../entities/notification.entity';

export const createNotificationSchema = z.object({
  title: z.string().min(1).max(200),
  message: z.string().min(1),
  type: z.nativeEnum(NotificationType),
  priority: z.nativeEnum(NotificationPriority).optional(),
  data: z.record(z.any()).optional(),
  action_url: z.string().max(500).optional(),
  action_text: z.string().max(200).optional(),
  image_url: z.string().url().max(500).optional(),
  category: z.string().max(100).optional(),
  scheduled_for: z.string().transform((val) => new Date(val)).optional(),
  user_id: z.string().uuid(),
  triggered_by_user_id: z.string().uuid().optional(),
});

export const updateNotificationSchema = z.object({
  mark_as_read: z.boolean().optional(),
  mark_as_clicked: z.boolean().optional(),
  data: z.record(z.any()).optional(),
  is_active: z.boolean().optional(),
});

export const createNotificationPreferenceSchema = z.object({
  notification_type: z.nativeEnum(NotificationType),
  delivery_channel: z.nativeEnum(DeliveryChannel),
  is_enabled: z.boolean().optional(),
  settings: z.record(z.any()).optional(),
  user_id: z.string().uuid(),
});

export const bulkNotificationSchema = z.object({
  user_ids: z.array(z.string().uuid()).min(1),
  title: z.string().min(1).max(200),
  message: z.string().min(1),
  type: z.nativeEnum(NotificationType),
  data: z.record(z.any()).optional(),
  action_url: z.string().max(500).optional(),
  triggered_by_user_id: z.string().uuid().optional(),
});

export const getNotificationSchema = z.object({
  id: z.string().uuid(),
});

export const getUserNotificationsSchema = z.object({
  userId: z.string().uuid(),
});

export type CreateNotificationDto = z.infer<typeof createNotificationSchema>;
export type UpdateNotificationDto = z.infer<typeof updateNotificationSchema>;
export type CreateNotificationPreferenceDto = z.infer<typeof createNotificationPreferenceSchema>;
export type BulkNotificationDto = z.infer<typeof bulkNotificationSchema>;
export type GetNotificationDto = z.infer<typeof getNotificationSchema>;
export type GetUserNotificationsDto = z.infer<typeof getUserNotificationsSchema>;