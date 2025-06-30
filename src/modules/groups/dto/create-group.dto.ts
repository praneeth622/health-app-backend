import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum GroupType {
  PUBLIC = 'public',
  PRIVATE = 'private',
  INVITE_ONLY = 'invite_only'
}

export enum GroupCategory {
  FITNESS = 'fitness',
  NUTRITION = 'nutrition',
  MENTAL_HEALTH = 'mental_health',
  WEIGHT_LOSS = 'weight_loss',
  MUSCLE_BUILDING = 'muscle_building',
  RUNNING = 'running',
  YOGA = 'yoga',
  GENERAL = 'general'
}

export class CreateGroupDto {
  @ApiProperty({
    description: 'Group name',
    example: 'Fitness Enthusiasts',
    maxLength: 200,
  })
  name: string;

  @ApiPropertyOptional({
    description: 'Group description',
    example: 'A community for fitness lovers to share tips and motivation',
  })
  description?: string;

  @ApiPropertyOptional({
    description: 'Group type - determines privacy level',
    enum: GroupType,
    example: GroupType.PUBLIC,
    default: GroupType.PUBLIC,
  })
  type?: GroupType;

  @ApiPropertyOptional({
    description: 'Group category',
    enum: GroupCategory,
    example: GroupCategory.FITNESS,
    default: GroupCategory.GENERAL,
  })
  category?: GroupCategory;

  @ApiPropertyOptional({
    description: 'Group profile image URL',
    example: 'https://example.com/group-image.jpg',
    maxLength: 500,
  })
  image_url?: string;

  @ApiPropertyOptional({
    description: 'Group cover image URL',
    example: 'https://example.com/group-cover.jpg',
    maxLength: 500,
  })
  cover_image_url?: string;

  @ApiPropertyOptional({
    description: 'Group rules',
    example: ['Be respectful', 'No spam', 'Stay on topic'],
    type: [String],
  })
  rules?: string[];

  @ApiPropertyOptional({
    description: 'Searchable tags',
    example: ['fitness', 'workout', 'health'],
    type: [String],
  })
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Maximum number of members (optional)',
    example: 1000,
    minimum: 1,
  })
  max_members?: number;

  @ApiProperty({
    description: 'Group owner user ID',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  owner_id: string;

  @ApiPropertyOptional({
    description: 'Group settings',
    example: {
      allow_member_posts: true,
      require_approval_for_posts: false,
      allow_member_invites: true
    },
  })
  settings?: Record<string, any>;
}
