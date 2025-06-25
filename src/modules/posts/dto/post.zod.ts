// src/modules/posts/dto/post.zod.ts
import { z } from 'zod';

export const PostTypeEnum = z.enum(['text', 'image', 'video', 'health_log', 'achievement']);

export const createPostSchema = z.object({
  content: z
    .string()
    .min(1, 'Content is required')
    .max(5000, 'Content must be less than 5000 characters'),
  type: PostTypeEnum.optional(),
  media_urls: z
    .array(z.string().url('Invalid media URL'))
    .max(10, 'Maximum 10 media files allowed')
    .optional(),
  metadata: z
    .record(z.any())
    .optional(),
  user_id: z
    .string()
    .uuid('Invalid user ID format'),
});

export const updatePostSchema = z.object({
  content: z
    .string()
    .min(1, 'Content is required')
    .max(5000, 'Content must be less than 5000 characters')
    .optional(),
  type: PostTypeEnum.optional(),
  media_urls: z
    .array(z.string().url('Invalid media URL'))
    .max(10, 'Maximum 10 media files allowed')
    .optional(),
  metadata: z
    .record(z.any())
    .optional(),
  is_active: z.boolean().optional(),
});

export const getPostByIdSchema = z.object({
  id: z.string().uuid('Invalid post ID format'),
});

export const getPostsByUserSchema = z.object({
  userId: z.string().uuid('Invalid user ID format'),
});

export type CreatePostDto = z.infer<typeof createPostSchema>;
export type UpdatePostDto = z.infer<typeof updatePostSchema>;
export type GetPostByIdDto = z.infer<typeof getPostByIdSchema>;
export type GetPostsByUserDto = z.infer<typeof getPostsByUserSchema>;