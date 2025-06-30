import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsUUID, IsOptional, MaxLength } from 'class-validator';

export class JoinGroupDto {
  @ApiProperty({
    description: 'User ID who wants to join',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @IsUUID()
  user_id: string;

  @ApiPropertyOptional({
    description: 'Message when requesting to join',
    example: 'Hi, I would like to join this fitness group!',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  join_message?: string;
}