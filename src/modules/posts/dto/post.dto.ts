import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { z } from 'zod';
import { CreatePostDto as CreatePostSchema, UpdatePostDto as UpdatePostSchema, GetPostByIdDto as GetPostByIdSchema } from './post.zod';
import { PostType, PostVisibility } from '../entities/post.entity';

// Re-export the Zod types as DTOs
export type CreatePostDto = CreatePostSchema;
export type UpdatePostDto = UpdatePostSchema;
export type GetPostByIdDto = GetPostByIdSchema;

export class GetPostsByUserDto {
  @ApiProperty({
    description: 'User ID (UUID)',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    format: 'uuid',
  })
  userId: string;
}

export class PostResponseDto {
  id: string;
  content: string;
  type: string;
  media_urls?: string[];
  metadata?: Record<string, any>;
  likes_count: number;
  comments_count: number;
  is_active: boolean;
  user_id: string;
  user?: {
    id: string;
    name: string;
    profile_image?: string;
  };
  created_at: Date;
  updated_at: Date;
}