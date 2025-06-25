import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PostType, PostVisibility } from '../entities/post.entity';

export class UpdatePostDto {
  @ApiPropertyOptional({
    description: 'Post content/text',
    example: 'Updated: Just completed my 10K run! Feeling amazing and ready for more challenges! 🏃‍♂️💪✨',
    minLength: 1,
    maxLength: 2000,
  })
  content?: string;

  @ApiPropertyOptional({
    description: 'Type of post',
    enum: PostType,
    example: PostType.ACHIEVEMENT,
  })
  type?: PostType;

  @ApiPropertyOptional({
    description: 'Post visibility setting',
    enum: PostVisibility,
    example: PostVisibility.FRIENDS,
  })
  visibility?: PostVisibility;

  @ApiPropertyOptional({
    description: 'Array of media URLs (images, videos)',
    example: [
      'https://example.com/updated-workout-photo.jpg',
      'https://example.com/celebration-video.mp4'
    ],
    type: [String],
  })
  media_urls?: string[];

  @ApiPropertyOptional({
    description: 'Tags and hashtags',
    example: ['#fitness', '#running', '#health', '#marathon-training', '@coach_username'],
    type: [String],
  })
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Additional metadata',
    example: {
      workout_type: 'running',
      distance_km: 10,
      duration_minutes: 42,
      calories_burned: 680,
      location: 'Central Park',
      weather: 'sunny',
      mood: 'excellent'
    },
  })
  metadata?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Whether the post is active/visible',
    example: true,
  })
  is_active?: boolean;
}

export class LikePostDto {
  @ApiProperty({
    description: 'Post ID to like',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    format: 'uuid',
  })
  postId: string;

  @ApiProperty({
    description: 'User ID who is liking the post',
    example: 'user-uuid-here',
    format: 'uuid',
  })
  userId: string;
}
