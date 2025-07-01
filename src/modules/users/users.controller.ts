import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UsePipes,
  HttpStatus,
  HttpCode,
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
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { ZodValidationPipe } from '../../shared/pipes/zod-validation.pipe';
import {
  createUserSchema,
  updateUserSchema,
  getUserByIdSchema,
} from './dto/user.zod';
// 🔧 Import auth components
import { SupabaseAuthGuard } from '../../auth/guards/supabase-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { User } from './entities/user.entity';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // 🔧 Keep this endpoint public for webhook user creation
  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    schema: {
      example: {
        id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        name: 'John Doe',
        email: 'john@example.com',
        date_of_birth: '1990-01-15',
        gender: 'male',
        height: 175.5,
        weight: 70.0,
        activity_level: 'moderate',
        health_goals: { weight_loss: true, fitness: true },
        profile_image: 'https://example.com/profile.jpg',
        bio: 'Health enthusiast',
        is_active: true,
        created_at: '2025-06-25T12:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body(new ZodValidationPipe(createUserSchema)) createUserDto: any,
  ) {
    const user = await this.usersService.create(createUserDto);
    const { password, ...userResponse } = user;
    return userResponse;
  }

  // 🔧 Protect this endpoint with auth
  @Get()
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all users' })
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
  @ApiResponse({
    status: 200,
    description: 'List of users',
    schema: {
      example: {
        users: [
          {
            id: 'user-uuid-1',
            name: 'John Doe',
            email: 'john@example.com',
            profile_image: 'https://example.com/profile1.jpg',
            bio: 'Health enthusiast',
            is_active: true,
            created_at: '2025-06-25T12:00:00.000Z',
          },
        ],
        total: 50,
        page: 1,
        limit: 20,
        total_pages: 3,
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @CurrentUser() currentUser: User, // 🔧 Inject current user
  ) {
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    const result = await this.usersService.findAll(pageNum, limitNum);
    return result;
  }

  // 🔧 Protect and allow users to get their own profile or any profile
  @Get(':id')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User ID (UUID)', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'User found',
    schema: {
      example: {
        id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        name: 'John Doe',
        email: 'john@example.com',
        date_of_birth: '1990-01-15',
        gender: 'male',
        height: 175.5,
        weight: 70.0,
        activity_level: 'moderate',
        health_goals: { weight_loss: true, fitness: true },
        medical_conditions: { allergies: ['peanuts'] },
        profile_image: 'https://example.com/profile.jpg',
        bio: 'Health enthusiast',
        is_active: true,
        health_logs: [],
        challenges: [],
        created_at: '2025-06-25T12:00:00.000Z',
        updated_at: '2025-06-25T12:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UsePipes(new ZodValidationPipe(getUserByIdSchema))
  async findOne(
    @Param() params: { id: string },
    @CurrentUser() currentUser: User,
  ) {
    return this.usersService.findOne(params.id);
  }

  // 🔧 Allow users to update their own profile
  @Patch(':id')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user by ID' })
  @ApiParam({ name: 'id', description: 'User ID (UUID)', type: 'string' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    schema: {
      example: {
        id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        name: 'John Smith',
        email: 'john.smith@example.com',
        profile_image: 'https://example.com/new-profile.jpg',
        bio: 'Updated bio',
        updated_at: '2025-06-25T13:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Cannot update other users' })
  @UsePipes(new ZodValidationPipe(getUserByIdSchema))
  async update(
    @Param() params: { id: string },
    @Body(new ZodValidationPipe(updateUserSchema)) updateUserDto: UpdateUserDto,
    @CurrentUser() currentUser: User,
  ) {
    // 🔧 Check if user is updating their own profile
    if (params.id !== currentUser.id) {
      throw new Error('You can only update your own profile');
    }

    return this.usersService.update(params.id, updateUserDto);
  }

  // 🔧 Allow users to delete their own account
  @Delete(':id')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete user by ID' })
  @ApiParam({ name: 'id', description: 'User ID (UUID)', type: 'string' })
  @ApiResponse({ status: 204, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Cannot delete other users' })
  @UsePipes(new ZodValidationPipe(getUserByIdSchema))
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param() params: { id: string },
    @CurrentUser() currentUser: User,
  ) {
    // 🔧 Check if user is deleting their own account
    if (params.id !== currentUser.id) {
      throw new Error('You can only delete your own account');
    }

    return this.usersService.remove(params.id);
  }

  // 🔧 Add endpoint to get current user's profile
  @Get('me/profile')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'Current user profile',
    schema: {
      example: {
        id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        name: 'John Doe',
        email: 'john@example.com',
        profile_image: 'https://example.com/profile.jpg',
        bio: 'Health enthusiast',
        health_goals: { weight_loss: true },
        created_at: '2025-06-25T12:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getCurrentUserProfile(@CurrentUser() currentUser: User) {
    return this.usersService.findOne(currentUser.id);
  }
}
