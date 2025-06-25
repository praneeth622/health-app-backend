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
