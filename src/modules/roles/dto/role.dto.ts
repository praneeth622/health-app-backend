import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateRoleDto as CreateRoleSchema, UpdateRoleDto as UpdateRoleSchema, GetRoleByIdDto as GetRoleByIdSchema } from './role.zod';

export class CreateRoleDto implements CreateRoleSchema {
  @ApiProperty({
    description: 'Role name',
    example: 'admin',
    minLength: 1,
    maxLength: 50,
  })
  name: string;
}

export class UpdateRoleDto implements UpdateRoleSchema {
  @ApiPropertyOptional({
    description: 'Role name',
    example: 'moderator',
    minLength: 1,
    maxLength: 50,
  })
  name?: string;
}

export class GetRoleByIdDto implements GetRoleByIdSchema {
  @ApiProperty({
    description: 'Role ID',
    example: 1,
  })
  id: number;
}

export class RoleResponseDto {
  @ApiProperty({
    description: 'Role ID',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Role name',
    example: 'admin',
  })
  name: string;
}