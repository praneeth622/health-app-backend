import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { GroupsService } from './groups.service';
import { CreateGroupDto, GroupType, GroupCategory } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { JoinGroupDto } from './dto/join-group.dto';
// 🔧 Import auth components
import { SupabaseAuthGuard } from '../../auth/guards/supabase-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('groups')
@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  // 🔧 Protect group creation
  @Post()
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new group' })
  @ApiBody({ type: CreateGroupDto })
  @ApiResponse({
    status: 201,
    description: 'Group created successfully',
    schema: {
      example: {
        id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        name: 'Fitness Enthusiasts',
        description: 'A community for fitness lovers to share tips and motivation',
        type: 'public',
        category: 'fitness',
        image_url: 'https://example.com/group-image.jpg',
        cover_image_url: 'https://example.com/group-cover.jpg',
        rules: ['Be respectful', 'No spam', 'Stay on topic'],
        tags: ['fitness', 'workout', 'health'],
        member_count: 1,
        max_members: 1000,
        is_active: true,
        is_featured: false,
        settings: {
          allow_member_posts: true,
          require_approval_for_posts: false,
          allow_member_invites: true
        },
        owner: {
          id: 'user-uuid',
          name: 'John Doe',
          email: 'john@example.com'
        },
        owner_id: 'user-uuid',
        created_at: '2025-06-26T12:00:00.000Z',
        updated_at: '2025-06-26T12:00:00.000Z'
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createGroupDto: CreateGroupDto,
    @CurrentUser() currentUser: User,
  ) {
    // 🔧 Automatically set the current user as owner
    createGroupDto.owner_id = currentUser.id;
    return this.groupsService.create(createGroupDto);
  }

  // 🔧 Keep groups listing public
  @Get()
  @ApiOperation({ summary: 'Get all groups with filtering and pagination' })
  @ApiQuery({
    name: 'page',
    description: 'Page number',
    required: false,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    description: 'Items per page',
    required: false,
    example: 20,
  })
  @ApiQuery({
    name: 'category',
    description: 'Filter by group category',
    required: false,
    enum: GroupCategory,
  })
  @ApiQuery({
    name: 'type',
    description: 'Filter by group type',
    required: false,
    enum: GroupType,
  })
  @ApiQuery({
    name: 'search',
    description: 'Search groups by name or description',
    required: false,
    example: 'fitness',
  })
  @ApiResponse({
    status: 200,
    description: 'List of groups',
    schema: {
      example: {
        groups: [
          {
            id: 'group-uuid-1',
            name: 'Fitness Enthusiasts',
            description: 'A community for fitness lovers',
            type: 'public',
            category: 'fitness',
            image_url: 'https://example.com/group1.jpg',
            member_count: 156,
            max_members: 1000,
            is_active: true,
            is_featured: true,
            owner: {
              id: 'user-uuid',
              name: 'John Doe',
              profile_image: 'https://example.com/profile.jpg'
            },
            created_at: '2025-06-26T12:00:00.000Z'
          }
        ],
        total: 50,
        page: 1,
        limit: 20,
        total_pages: 3
      }
    }
  })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('category') category?: GroupCategory,
    @Query('type') type?: GroupType,
    @Query('search') search?: string,
  ) {
    return this.groupsService.findAll(page, limit, category, type, search);
  }

  // 🔧 Keep individual group view public
  @Get(':id')
  @ApiOperation({ summary: 'Get group by ID' })
  @ApiParam({ name: 'id', description: 'Group ID (UUID)', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Group details',
    schema: {
      example: {
        id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        name: 'Fitness Enthusiasts',
        description: 'A community for fitness lovers to share tips and motivation',
        type: 'public',
        category: 'fitness',
        image_url: 'https://example.com/group-image.jpg',
        cover_image_url: 'https://example.com/group-cover.jpg',
        rules: ['Be respectful', 'No spam', 'Stay on topic'],
        tags: ['fitness', 'workout', 'health'],
        member_count: 156,
        max_members: 1000,
        is_active: true,
        is_featured: false,
        settings: {
          allow_member_posts: true,
          require_approval_for_posts: false
        },
        owner: {
          id: 'user-uuid',
          name: 'John Doe',
          email: 'john@example.com',
          profile_image: 'https://example.com/profile.jpg'
        },
        memberships: [
          {
            id: 'membership-uuid',
            role: 'owner',
            status: 'active',
            joined_at: '2025-06-26T12:00:00.000Z',
            user: {
              id: 'user-uuid',
              name: 'John Doe',
              profile_image: 'https://example.com/profile.jpg'
            }
          }
        ],
        created_at: '2025-06-26T12:00:00.000Z',
        updated_at: '2025-06-26T12:00:00.000Z'
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Group not found' })
  findOne(@Param('id') id: string) {
    return this.groupsService.findOne(id);
  }

  // 🔧 Protect group updates - only owner/admin can update
  @Patch(':id')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update group by ID' })
  @ApiParam({ name: 'id', description: 'Group ID (UUID)', type: 'string' })
  @ApiBody({ type: UpdateGroupDto })
  @ApiResponse({
    status: 200,
    description: 'Group updated successfully',
    schema: {
      example: {
        id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        name: 'Updated Fitness Community',
        description: 'Updated description',
        member_count: 156,
        is_featured: true,
        updated_at: '2025-06-26T13:00:00.000Z'
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Group not found' })
  @ApiResponse({ status: 403, description: 'Not authorized to update this group' })
  update(
    @Param('id') id: string,
    @Body() updateGroupDto: UpdateGroupDto,
    @CurrentUser() currentUser: User,
  ) {
    // 🔧 You'll need to add authorization logic in service
    return this.groupsService.update(id, updateGroupDto);
  }

  // 🔧 Protect group deletion
  @Delete(':id')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete (deactivate) group by ID' })
  @ApiParam({ name: 'id', description: 'Group ID (UUID)', type: 'string' })
  @ApiResponse({ status: 204, description: 'Group deleted successfully' })
  @ApiResponse({ status: 404, description: 'Group not found' })
  @ApiResponse({ status: 403, description: 'Not authorized to delete this group' })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id') id: string,
    @CurrentUser() currentUser: User,
  ) {
    return this.groupsService.remove(id);
  }

  // 🔧 Protect group joining
  @Post(':id/join')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Join a group' })
  @ApiParam({ name: 'id', description: 'Group ID (UUID)', type: 'string' })
  @ApiBody({ type: JoinGroupDto })
  @ApiResponse({
    status: 201,
    description: 'Successfully joined group or request sent',
    schema: {
      example: {
        id: 'membership-uuid',
        role: 'member',
        status: 'active',
        joined_at: '2025-06-26T13:00:00.000Z',
        join_message: 'Hi, I would like to join this fitness group!',
        group_id: 'group-uuid',
        user_id: 'user-uuid',
        created_at: '2025-06-26T13:00:00.000Z'
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Group not found' })
  @ApiResponse({ status: 409, description: 'User is already a member' })
  @ApiResponse({ status: 403, description: 'Group is at maximum capacity' })
  @HttpCode(HttpStatus.CREATED)
  joinGroup(
    @Param('id') id: string,
    @Body() joinGroupDto: JoinGroupDto,
    @CurrentUser() currentUser: User,
  ) {
    // 🔧 Automatically set the current user as the one joining
    joinGroupDto.user_id = currentUser.id;
    return this.groupsService.joinGroup(id, joinGroupDto);
  }

  // 🔧 Keep members list public (optional: you might want to protect this)
  @Get(':id/members')
  @ApiOperation({ summary: 'Get group members' })
  @ApiParam({ name: 'id', description: 'Group ID (UUID)', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'List of group members',
    schema: {
      example: [
        {
          id: 'membership-uuid-1',
          role: 'owner',
          status: 'active',
          joined_at: '2025-06-26T12:00:00.000Z',
          permissions: {
            can_post: true,
            can_moderate: true
          },
          user: {
            id: 'user-uuid-1',
            name: 'John Doe',
            email: 'john@example.com',
            profile_image: 'https://example.com/profile1.jpg'
          }
        },
        {
          id: 'membership-uuid-2',
          role: 'member',
          status: 'active',
          joined_at: '2025-06-26T12:30:00.000Z',
          user: {
            id: 'user-uuid-2',
            name: 'Jane Smith',
            profile_image: 'https://example.com/profile2.jpg'
          }
        }
      ]
    }
  })
  @ApiResponse({ status: 404, description: 'Group not found' })
  getMembers(@Param('id') id: string) {
    return this.groupsService.getGroupMembers(id);
  }
}
