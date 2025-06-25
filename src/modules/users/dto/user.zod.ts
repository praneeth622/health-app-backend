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