import { z } from 'zod';
import { AnalyticsType, PeriodType } from '../entities/analytics.entity';

export const createAnalyticsSchema = z.object({
  type: z.nativeEnum(AnalyticsType),
  period_type: z.nativeEnum(PeriodType),
  period_start: z.string().transform((val) => new Date(val)),
  period_end: z.string().transform((val) => new Date(val)),
  metrics: z.record(z.any()),
  insights: z.record(z.any()).optional(),
  score: z.number().min(0).max(100).optional(),
  goals_progress: z.record(z.any()).optional(),
  user_id: z.string().uuid('Invalid user ID format'),
});

export const updateAnalyticsSchema = z.object({
  metrics: z.record(z.any()).optional(),
  insights: z.record(z.any()).optional(),
  score: z.number().min(0).max(100).optional(),
  goals_progress: z.record(z.any()).optional(),
});

export const getAnalyticsByIdSchema = z.object({
  id: z.string().uuid('Invalid analytics ID format'),
});

export const getUserAnalyticsSchema = z.object({
  userId: z.string().uuid('Invalid user ID format'),
});

export const dashboardSummarySchema = z.object({
  userId: z.string().uuid('Invalid user ID format'),
});

export const createDashboardSettingsSchema = z.object({
  widget_preferences: z.record(z.any()),
  chart_preferences: z.record(z.any()),
  notification_preferences: z.record(z.any()).optional(),
  theme: z.string().optional(),
  units_preference: z.string().optional(),
  user_id: z.string().uuid('Invalid user ID format'),
});

export type CreateAnalyticsDto = z.infer<typeof createAnalyticsSchema>;
export type UpdateAnalyticsDto = z.infer<typeof updateAnalyticsSchema>;
export type GetAnalyticsDto = z.infer<typeof getAnalyticsByIdSchema>;
export type GetUserAnalyticsDto = z.infer<typeof getUserAnalyticsSchema>;
export type DashboardSummaryDto = z.infer<typeof dashboardSummarySchema>;
export type CreateDashboardSettingsDto = z.infer<typeof createDashboardSettingsSchema>;