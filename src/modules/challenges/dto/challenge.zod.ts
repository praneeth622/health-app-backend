import { z } from 'zod';
import { ChallengeType, ChallengeStatus, ChallengeDifficulty } from '../entities/challenge.entity';

export const ChallengeTypeEnum = z.nativeEnum(ChallengeType);
export const ChallengeStatusEnum = z.nativeEnum(ChallengeStatus);
export const ChallengeDifficultyEnum = z.nativeEnum(ChallengeDifficulty);

export const createChallengeSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description must be less than 2000 characters'),
  type: ChallengeTypeEnum,
  difficulty: ChallengeDifficultyEnum.optional(),
  goal: z
    .record(z.any())
    .refine((goal) => goal.target && goal.unit, {
      message: 'Goal must include target and unit'
    }),
  duration_days: z
    .number()
    .int()
    .min(1, 'Duration must be at least 1 day')
    .max(365, 'Duration cannot exceed 365 days'),
  start_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format')
    .transform((str) => new Date(str)),
  is_public: z
    .boolean()
    .optional(),
  max_participants: z
    .number()
    .int()
    .min(0, 'Max participants must be positive')
    .max(10000, 'Max participants cannot exceed 10000')
    .optional(),
  rewards: z
    .record(z.any())
    .optional(),
  rules: z
    .record(z.any())
    .optional(),
  image_url: z
    .string()
    .url('Invalid image URL')
    .optional(),
  creator_id: z
    .string()
    .uuid('Invalid creator ID format'),
});

export const updateChallengeSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters')
    .optional(),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description must be less than 2000 characters')
    .optional(),
  type: ChallengeTypeEnum.optional(),
  difficulty: ChallengeDifficultyEnum.optional(),
  goal: z
    .record(z.any())
    .refine((goal) => goal.target && goal.unit, {
      message: 'Goal must include target and unit'
    })
    .optional(),
  duration_days: z
    .number()
    .int()
    .min(1, 'Duration must be at least 1 day')
    .max(365, 'Duration cannot exceed 365 days')
    .optional(),
  start_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format')
    .transform((str) => new Date(str))
    .optional(),
  status: ChallengeStatusEnum.optional(),
  is_public: z
    .boolean()
    .optional(),
  max_participants: z
    .number()
    .int()
    .min(0, 'Max participants must be positive')
    .max(10000, 'Max participants cannot exceed 10000')
    .optional(),
  rewards: z
    .record(z.any())
    .optional(),
  rules: z
    .record(z.any())
    .optional(),
  image_url: z
    .string()
    .url('Invalid image URL')
    .optional(),
});

export const getChallengeByIdSchema = z.object({
  id: z.string().uuid('Invalid challenge ID format'),
});

export const joinChallengeSchema = z.object({
  challengeId: z.string().uuid('Invalid challenge ID format'),
  userId: z.string().uuid('Invalid user ID format'),
});

export const updateProgressSchema = z.object({
  challengeId: z.string().uuid('Invalid challenge ID format'),
  userId: z.string().uuid('Invalid user ID format'),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .transform((str) => new Date(str)),
  progress_data: z
    .record(z.any())
    .refine((data) => Object.keys(data).length > 0, {
      message: 'Progress data cannot be empty'
    }),
  notes: z
    .record(z.any())
    .optional(),
});

export type CreateChallengeDto = z.infer<typeof createChallengeSchema>;
export type UpdateChallengeDto = z.infer<typeof updateChallengeSchema>;
export type GetChallengeByIdDto = z.infer<typeof getChallengeByIdSchema>;
export type JoinChallengeDto = z.infer<typeof joinChallengeSchema>;
export type UpdateProgressDto = z.infer<typeof updateProgressSchema>;