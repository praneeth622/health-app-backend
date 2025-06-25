import { z } from 'zod';

export const createCommentSchema = z.object({
  content: z
    .string()
    .min(1, 'Content is required')
    .max(1000, 'Content must be less than 1000 characters'),
  user_id: z
    .string()
    .uuid('Invalid user ID format'),
  post_id: z
    .string()
    .uuid('Invalid post ID format'),
});

export const updateCommentSchema = z.object({
  content: z
    .string()
    .min(1, 'Content is required')
    .max(1000, 'Content must be less than 1000 characters')
    .optional(),
  is_active: z.boolean().optional(),
});

export const getCommentByIdSchema = z.object({
  id: z.string().uuid('Invalid comment ID format'),
});

export const getCommentsByPostSchema = z.object({
  postId: z.string().uuid('Invalid post ID format'),
});

export type CreateCommentDto = z.infer<typeof createCommentSchema>;
export type UpdateCommentDto = z.infer<typeof updateCommentSchema>;
export type GetCommentByIdDto = z.infer<typeof getCommentByIdSchema>;
export type GetCommentsByPostDto = z.infer<typeof getCommentsByPostSchema>;
