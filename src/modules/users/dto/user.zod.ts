import { z } from 'zod';

export const createUserSchema = z.object({
  email: z
    .string()
    .email('Invalid email format')
    .max(255, 'Email must be less than 255 characters'),
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters')
    .optional(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be less than 128 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      'Password must contain uppercase, lowercase, number and special character'),
  date_of_birth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .optional(),
  gender: z
    .enum(['male', 'female', 'other', 'prefer_not_to_say'])
    .optional(),
  height: z
    .number()
    .min(50, 'Height must be at least 50 cm')
    .max(300, 'Height must be less than 300 cm')
    .optional(),
  weight: z
    .number()
    .min(20, 'Weight must be at least 20 kg')
    .max(500, 'Weight must be less than 500 kg')
    .optional(),
  activity_level: z
    .enum(['sedentary', 'light', 'moderate', 'active', 'very_active'])
    .optional(),
  health_goals: z
    .record(z.boolean())
    .optional(),
  medical_conditions: z
    .record(z.any())
    .optional(),
  bio: z
    .string()
    .max(1000, 'Bio must be less than 1000 characters')
    .optional(),
  profile_image: z
    .string()
    .url('Invalid profile image URL')
    .optional(),
  cover_image: z
    .string()
    .url('Invalid cover image URL')
    .optional(),
  fitness_goal: z
    .string()
    .max(100, 'Fitness goal must be less than 100 characters')
    .optional(),
  interests: z
    .array(z.string())
    .optional(),
  role_id: z
    .number()
    .int()
    .positive()
    .optional(),
});

export const updateUserSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters')
    .optional(),
  email: z
    .string()
    .email('Invalid email format')
    .max(255, 'Email must be less than 255 characters')
    .optional(),
  date_of_birth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .optional(),
  gender: z
    .enum(['male', 'female', 'other', 'prefer_not_to_say'])
    .optional(),
  height: z
    .number()
    .min(50, 'Height must be at least 50 cm')
    .max(300, 'Height must be less than 300 cm')
    .optional(),
  weight: z
    .number()
    .min(20, 'Weight must be at least 20 kg')
    .max(500, 'Weight must be less than 500 kg')
    .optional(),
  activity_level: z
    .enum(['sedentary', 'light', 'moderate', 'active', 'very_active'])
    .optional(),
  health_goals: z
    .record(z.boolean())
    .optional(),
  medical_conditions: z
    .record(z.any())
    .optional(),
  bio: z
    .string()
    .max(1000, 'Bio must be less than 1000 characters')
    .optional(),
  profile_image: z
    .string()
    .url('Invalid profile image URL')
    .optional(),
  cover_image: z
    .string()
    .url('Invalid cover image URL')
    .optional(),
  fitness_goal: z
    .string()
    .max(100, 'Fitness goal must be less than 100 characters')
    .optional(),
  interests: z
    .array(z.string())
    .optional(),
  role_id: z
    .number()
    .int()
    .positive()
    .optional(),
});

export const getUserByIdSchema = z.object({
  id: z.string().uuid('Invalid user ID format'),
});

export type CreateUserDto = z.infer<typeof createUserSchema>;
export type UpdateUserDto = z.infer<typeof updateUserSchema>;
export type GetUserByIdDto = z.infer<typeof getUserByIdSchema>;