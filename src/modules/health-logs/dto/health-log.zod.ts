import { z } from 'zod';

export const createHealthLogSchema = z.object({
  user_id: z
    .string()
    .uuid('Invalid user ID format'),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .transform((str) => new Date(str)),
  calories: z
    .number()
    .int()
    .min(0, 'Calories must be positive')
    .max(10000, 'Calories must be realistic')
    .optional(),
  steps: z
    .number()
    .int()
    .min(0, 'Steps must be positive')
    .max(100000, 'Steps must be realistic')
    .optional(),
  hydration_ml: z
    .number()
    .int()
    .min(0, 'Hydration must be positive')
    .max(10000, 'Hydration must be realistic (in ml)')
    .optional(),
  sleep_hours: z
    .number()
    .min(0, 'Sleep hours must be positive')
    .max(24, 'Sleep hours cannot exceed 24')
    .optional(),
  vitamin_summary: z
    .string()
    .max(500, 'Vitamin summary must be less than 500 characters')
    .optional(),
  additional_metrics: z
    .record(z.any())
    .optional(),
});

export const updateHealthLogSchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .transform((str) => new Date(str))
    .optional(),
  calories: z
    .number()
    .int()
    .min(0, 'Calories must be positive')
    .max(10000, 'Calories must be realistic')
    .optional(),
  steps: z
    .number()
    .int()
    .min(0, 'Steps must be positive')
    .max(100000, 'Steps must be realistic')
    .optional(),
  hydration_ml: z
    .number()
    .int()
    .min(0, 'Hydration must be positive')
    .max(10000, 'Hydration must be realistic (in ml)')
    .optional(),
  sleep_hours: z
    .number()
    .min(0, 'Sleep hours must be positive')
    .max(24, 'Sleep hours cannot exceed 24')
    .optional(),
  vitamin_summary: z
    .string()
    .max(500, 'Vitamin summary must be less than 500 characters')
    .optional(),
  additional_metrics: z
    .record(z.any())
    .optional(),
});

export const getHealthLogByIdSchema = z.object({
  id: z.string().uuid('Invalid health log ID format'),
});

export const getHealthLogsByUserSchema = z.object({
  userId: z.string().uuid('Invalid user ID format'),
});

export const getHealthLogsByDateRangeSchema = z.object({
  userId: z.string().uuid('Invalid user ID format'),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format'),
});

export type CreateHealthLogDto = z.infer<typeof createHealthLogSchema>;
export type UpdateHealthLogDto = z.infer<typeof updateHealthLogSchema>;
export type GetHealthLogByIdDto = z.infer<typeof getHealthLogByIdSchema>;
export type GetHealthLogsByUserDto = z.infer<typeof getHealthLogsByUserSchema>;
export type GetHealthLogsByDateRangeDto = z.infer<typeof getHealthLogsByDateRangeSchema>;