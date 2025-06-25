import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRoleDto {
  @ApiProperty({
    description: 'Role name',
    example: 'admin',
    minLength: 1,
    maxLength: 50,
  })
  name: string;

  @ApiPropertyOptional({
    description: 'Role description',
    example: 'Administrator role with full access',
    maxLength: 500,
  })
  description?: string;

  @ApiPropertyOptional({
    description: 'Role permissions',
    example: { read: true, write: true, delete: true },
  })
  permissions?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Whether the role is active',
    example: true,
    default: true,
  })
  is_active?: boolean;
}

export class UpdateRoleDto {
  @ApiPropertyOptional({
    description: 'Role name',
    example: 'moderator',
    minLength: 1,
    maxLength: 50,
  })
  name?: string;

  @ApiPropertyOptional({
    description: 'Role description',
    example: 'Moderator role with limited access',
    maxLength: 500,
  })
  description?: string;

  @ApiPropertyOptional({
    description: 'Role permissions',
    example: { read: true, write: false, delete: false },
  })
  permissions?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Whether the role is active',
    example: true,
  })
  is_active?: boolean;
}

export class GetRoleByIdDto {
  @ApiProperty({
    description: 'Role ID (UUID)',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    format: 'uuid',
  })
  id: string;
}

export class RoleResponseDto {
  @ApiProperty({
    description: 'Role ID (UUID)',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    format: 'uuid',
  })
  id: string;

  @ApiProperty({
    description: 'Role name',
    example: 'admin',
  })
  name: string;

  @ApiPropertyOptional({
    description: 'Role description',
    example: 'Administrator role with full access',
  })
  description?: string;

  @ApiPropertyOptional({
    description: 'Role permissions',
    example: { read: true, write: true, delete: true },
  })
  permissions?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Whether the role is active',
    example: true,
  })
  is_active?: boolean;

  @ApiProperty({
    description: 'Role creation date',
    example: '2025-06-25T12:00:00.000Z',
  })
  created_at: Date;

  @ApiProperty({
    description: 'Role last update date',
    example: '2025-06-25T12:00:00.000Z',
  })
  updated_at: Date;
}