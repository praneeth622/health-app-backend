import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PostType, PostVisibility } from '../entities/post.entity';

export class CreatePostDto {
  @ApiProperty({
    description: 'Post content/text',
    example: 'Just completed my 10K run! Feeling amazing 🏃‍♂️💪',
    minLength: 1,
    maxLength: 2000,
  })
  content: string;

  @ApiPropertyOptional({
    description: 'Type of post',
    enum: PostType,
    example: PostType.ACHIEVEMENT,
    default: PostType.TEXT,
  })
  type?: PostType;

  @ApiPropertyOptional({
    description: 'Post visibility setting',
    enum: PostVisibility,
    example: PostVisibility.PUBLIC,
    default: PostVisibility.PUBLIC,
  })
  visibility?: PostVisibility;

  @ApiPropertyOptional({
    description: 'Array of media URLs (images, videos)',
    example: [
      'https://example.com/workout-photo.jpg',
      'https://example.com/progress-video.mp4'
    ],
    type: [String],
  })
  media_urls?: string[];

  @ApiPropertyOptional({
    description: 'Tags and hashtags',
    example: ['#fitness', '#running', '#health', '@friend_username'],
    type: [String],
  })
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Additional metadata based on post type',
    example: {
      workout_type: 'running',
      distance_km: 10,
      duration_minutes: 45,
      calories_burned: 650,
      location: 'Central Park'
    },
  })
  metadata?: Record<string, any>;

  @ApiProperty({
    description: 'ID of the user creating the post',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    format: 'uuid',
  })
  user_id: string;
}
