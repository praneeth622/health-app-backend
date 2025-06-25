// src/modules/posts/dto/post.zod.ts
import { z } from 'zod';
import { PostType, PostVisibility } from '../entities/post.entity';

export const createPostSchema = z.object({
  content: z
    .string()
    .min(1, 'Content is required')
    .max(2000, 'Content must be less than 2000 characters'),
  type: z
    .nativeEnum(PostType)
    .optional(),
  visibility: z
    .nativeEnum(PostVisibility)
    .optional(),
  media_urls: z
    .array(z.string().url('Invalid media URL'))
    .optional(),
  tags: z
    .array(z.string())
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
    .max(2000, 'Content must be less than 2000 characters')
    .optional(),
  type: z
    .nativeEnum(PostType)
    .optional(),
  visibility: z
    .nativeEnum(PostVisibility)
    .optional(),
  media_urls: z
    .array(z.string().url('Invalid media URL'))
    .optional(),
  tags: z
    .array(z.string())
    .optional(),
  metadata: z
    .record(z.any())
    .optional(),
  is_active: z
    .boolean()
    .optional(),
});

export const getPostByIdSchema = z.object({
  id: z.string().uuid('Invalid post ID format'),
});

export const likePostSchema = z.object({
  postId: z.string().uuid('Invalid post ID format'),
  userId: z.string().uuid('Invalid user ID format'),
});

export type CreatePostDto = z.infer<typeof createPostSchema>;
export type UpdatePostDto = z.infer<typeof updatePostSchema>;
export type GetPostByIdDto = z.infer<typeof getPostByIdSchema>;
export type LikePostDto = z.infer<typeof likePostSchema>;