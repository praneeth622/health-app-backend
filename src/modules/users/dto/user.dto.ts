import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: 'User full name',
    example: 'John Doe',
    minLength: 2,
    maxLength: 100,
  })
  name: string;

  @ApiProperty({
    description: 'User email address',
    example: 'john@example.com',
    format: 'email',
  })
  email: string;

  @ApiProperty({
    description: 'User password',
    example: 'SecurePassword123!',
    minLength: 8,
  })
  password: string;

  @ApiPropertyOptional({
    description: 'Date of birth',
    example: '1990-01-15',
    format: 'date',
  })
  date_of_birth?: Date;

  @ApiPropertyOptional({
    description: 'Gender',
    enum: ['male', 'female', 'other'],
    example: 'male',
  })
  gender?: 'male' | 'female' | 'other';

  @ApiPropertyOptional({
    description: 'Height in centimeters',
    example: 175.5,
    minimum: 50,
    maximum: 300,
  })
  height?: number;

  @ApiPropertyOptional({
    description: 'Weight in kilograms',
    example: 70.0,
    minimum: 20,
    maximum: 500,
  })
  weight?: number;

  @ApiPropertyOptional({
    description: 'Activity level',
    example: 'moderate',
    enum: ['sedentary', 'light', 'moderate', 'active', 'very_active'],
  })
  activity_level?: string;

  @ApiPropertyOptional({
    description: 'Health goals',
    example: { weight_loss: true, muscle_gain: false, endurance: true },
  })
  health_goals?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Medical conditions',
    example: { diabetes: false, hypertension: false, allergies: ['peanuts'] },
  })
  medical_conditions?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Profile image URL',
    example: 'https://example.com/profile.jpg',
    format: 'url',
  })
  profile_image?: string;

  @ApiPropertyOptional({
    description: 'User bio',
    example: 'Health enthusiast and fitness lover',
    maxLength: 500,
  })
  bio?: string;
}

export class UpdateUserDto {
  @ApiPropertyOptional({
    description: 'User full name',
    example: 'John Smith',
    minLength: 2,
    maxLength: 100,
  })
  name?: string;

  @ApiPropertyOptional({
    description: 'User email address',
    example: 'john.smith@example.com',
    format: 'email',
  })
  email?: string;

  @ApiPropertyOptional({
    description: 'Date of birth',
    example: '1990-01-15',
    format: 'date',
  })
  date_of_birth?: Date;

  @ApiPropertyOptional({
    description: 'Gender',
    enum: ['male', 'female', 'other'],
    example: 'male',
  })
  gender?: 'male' | 'female' | 'other';

  @ApiPropertyOptional({
    description: 'Height in centimeters',
    example: 180.0,
    minimum: 50,
    maximum: 300,
  })
  height?: number;

  @ApiPropertyOptional({
    description: 'Weight in kilograms',
    example: 75.0,
    minimum: 20,
    maximum: 500,
  })
  weight?: number;

  @ApiPropertyOptional({
    description: 'Activity level',
    example: 'active',
    enum: ['sedentary', 'light', 'moderate', 'active', 'very_active'],
  })
  activity_level?: string;

  @ApiPropertyOptional({
    description: 'Health goals',
    example: { weight_loss: false, muscle_gain: true, endurance: true },
  })
  health_goals?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Medical conditions',
    example: { diabetes: false, hypertension: false, allergies: [] },
  })
  medical_conditions?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Profile image URL',
    example: 'https://example.com/new-profile.jpg',
    format: 'url',
  })
  profile_image?: string;

  @ApiPropertyOptional({
    description: 'User bio',
    example: 'Updated bio with new interests',
    maxLength: 500,
  })
  bio?: string;

  @ApiPropertyOptional({
    description: 'Account active status',
    example: true,
  })
  is_active?: boolean;
}