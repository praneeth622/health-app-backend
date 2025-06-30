import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateGroupDto } from './create-group.dto';

export class UpdateGroupDto extends PartialType(CreateGroupDto) {
  @ApiPropertyOptional({
    description: 'Whether the group is active',
    example: true,
  })
  is_active?: boolean;

  @ApiPropertyOptional({
    description: 'Whether the group is featured',
    example: false,
  })
  is_featured?: boolean;
}
