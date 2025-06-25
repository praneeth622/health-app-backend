import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({
    description: 'Comment content',
    example: 'Great post! Thanks for sharing your workout routine 💪',
    minLength: 1,
    maxLength: 1000,
  })
  content: string;

  @ApiProperty({
    description: 'ID of the post being commented on',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    format: 'uuid',
  })
  post_id: string;

  @ApiProperty({
    description: 'ID of the user making the comment',
    example: 'user-uuid-here',
    format: 'uuid',
  })
  user_id: string;

  @ApiPropertyOptional({
    description: 'ID of parent comment if this is a reply',
    example: 'parent-comment-uuid',
    format: 'uuid',
  })
  parent_comment_id?: string;

  @ApiPropertyOptional({
    description: 'Array of media URLs (images, gifs)',
    example: ['https://example.com/reaction.gif'],
    type: [String],
  })
  media_urls?: string[];
}

export class UpdateCommentDto {
  @ApiPropertyOptional({
    description: 'Updated comment content',
    example: 'Updated: Great post! Thanks for sharing your workout routine 💪 Really inspiring!',
    minLength: 1,
    maxLength: 1000,
  })
  content?: string;

  @ApiPropertyOptional({
    description: 'Array of media URLs (images, gifs)',
    example: ['https://example.com/updated-reaction.gif'],
    type: [String],
  })
  media_urls?: string[];

  @ApiPropertyOptional({
    description: 'Whether the comment is active/visible',
    example: true,
  })
  is_active?: boolean;
}

export class GetCommentByIdDto {
  @ApiProperty({
    description: 'Comment ID (UUID)',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    format: 'uuid',
  })
  id: string;
}

export class GetCommentsByPostDto {
  @ApiProperty({
    description: 'Post ID (UUID)',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    format: 'uuid',
  })
  postId: string;
}

export class CommentResponseDto {
  @ApiProperty({
    description: 'Comment ID',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  id: string;

  @ApiProperty({
    description: 'Comment content',
    example: 'Great post! Thanks for sharing 💪',
  })
  content: string;

  @ApiProperty({
    description: 'Number of likes',
    example: 5,
  })
  likes_count: number;

  @ApiProperty({
    description: 'Whether comment is active',
    example: true,
  })
  is_active: boolean;

  @ApiProperty({
    description: 'User ID who made the comment',
    example: 'user-uuid-here',
  })
  user_id: string;

  @ApiProperty({
    description: 'Post ID this comment belongs to',
    example: 'post-uuid-here',
  })
  post_id: string;

  @ApiPropertyOptional({
    description: 'Parent comment ID if this is a reply',
    example: 'parent-comment-uuid',
  })
  parent_comment_id?: string;

  @ApiPropertyOptional({
    description: 'User details',
  })
  user?: {
    id: string;
    name: string;
    profile_image?: string;
  };

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2025-06-25T12:00:00.000Z',
  })
  created_at: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2025-06-25T12:00:00.000Z',
  })
  updated_at: Date;
}