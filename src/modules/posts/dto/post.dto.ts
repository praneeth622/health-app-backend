import { z } from 'zod';
import { CreatePostDto as CreatePostSchema, UpdatePostDto as UpdatePostSchema, GetPostByIdDto as GetPostByIdSchema, GetPostsByUserDto as GetPostsByUserSchema } from './post.zod';
import { PostType } from '../entities/post.entity';

export class CreatePostDto implements CreatePostSchema {
  content: string;
  type?: PostType;
  media_urls?: string[];
  metadata?: Record<string, any>;
  user_id: string;
}

export class UpdatePostDto implements UpdatePostSchema {
  content?: string;
  type?: PostType;
  media_urls?: string[];
  metadata?: Record<string, any>;
  is_active?: boolean;
}

export class GetPostByIdDto implements GetPostByIdSchema {
  id: string;
}

export class GetPostsByUserDto implements GetPostsByUserSchema {
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