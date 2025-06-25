import { z } from 'zod';
import { ReminderType, ReminderFrequency, ReminderStatus } from '../entities/reminder.entity';

export const ReminderTypeEnum = z.nativeEnum(ReminderType);
export const ReminderFrequencyEnum = z.nativeEnum(ReminderFrequency);
export const ReminderStatusEnum = z.nativeEnum(ReminderStatus);

export const createReminderSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),
  description: z
    .string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional(),
  type: ReminderTypeEnum,
  frequency: ReminderFrequencyEnum,
  time: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:MM format'),
  start_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format')
    .transform((str) => new Date(str))
    .optional(),
  end_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format')
    .transform((str) => new Date(str))
    .optional(),
  custom_schedule: z
    .record(z.any())
    .optional(),
  is_notification_enabled: z
    .boolean()
    .optional(),
  metadata: z
    .record(z.any())
    .optional(),
  user_id: z
    .string()
    .uuid('Invalid user ID format'),
});

export const updateReminderSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters')
    .optional(),
  description: z
    .string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional(),
  type: ReminderTypeEnum.optional(),
  frequency: ReminderFrequencyEnum.optional(),
  time: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:MM format')
    .optional(),
  start_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format')
    .transform((str) => new Date(str))
    .optional(),
  end_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format')
    .transform((str) => new Date(str))
    .optional(),
  custom_schedule: z
    .record(z.any())
    .optional(),
  status: ReminderStatusEnum.optional(),
  is_notification_enabled: z
    .boolean()
    .optional(),
  metadata: z
    .record(z.any())
    .optional(),
});

export const getReminderByIdSchema = z.object({
  id: z.string().uuid('Invalid reminder ID format'),
});

export const getRemindersByUserSchema = z.object({
  userId: z.string().uuid('Invalid user ID format'),
});

export const updateReminderStatusSchema = z.object({
  status: ReminderStatusEnum,
});

export type CreateReminderDto = z.infer<typeof createReminderSchema>;
export type UpdateReminderDto = z.infer<typeof updateReminderSchema>;
export type GetReminderByIdDto = z.infer<typeof getReminderByIdSchema>;
export type GetRemindersByUserDto = z.infer<typeof getRemindersByUserSchema>;
export type UpdateReminderStatusDto = z.infer<typeof updateReminderStatusSchema>;