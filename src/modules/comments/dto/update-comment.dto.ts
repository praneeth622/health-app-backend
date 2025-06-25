import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';

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

export class LikeCommentDto {
  @ApiProperty({
    description: 'Comment ID to like',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    format: 'uuid',
  })
  commentId: string;

  @ApiProperty({
    description: 'User ID who is liking the comment',
    example: 'user-uuid-here',
    format: 'uuid',
  })
  userId: string;
}
