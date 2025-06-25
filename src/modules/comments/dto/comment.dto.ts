import { CreateCommentDto as CreateCommentSchema, UpdateCommentDto as UpdateCommentSchema, GetCommentByIdDto as GetCommentByIdSchema, GetCommentsByPostDto as GetCommentsByPostSchema } from './comment.zod';

export class CreateCommentDto implements CreateCommentSchema {
  content: string;
  user_id: string;
  post_id: string;
}

export class UpdateCommentDto implements UpdateCommentSchema {
  content?: string;
  is_active?: boolean;
}

export class GetCommentByIdDto implements GetCommentByIdSchema {
  id: string;
}

export class GetCommentsByPostDto implements GetCommentsByPostSchema {
  postId: string;
}

export class CommentResponseDto {
  id: string;
  content: string;
  likes_count: number;
  is_active: boolean;
  user_id: string;
  post_id: string;
  user?: {
    id: string;
    name: string;
    profile_image?: string;
  };
  created_at: Date;
  updated_at: Date;
}