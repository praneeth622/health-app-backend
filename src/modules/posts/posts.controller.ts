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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto, LikePostDto } from './dto/update-post.dto';
import { PostType } from './entities/post.entity';
import { ZodValidationPipe } from '../../shared/pipes/zod-validation.pipe';
import {
  createPostSchema,
  updatePostSchema,
  getPostByIdSchema,
  likePostSchema,
} from './dto/post.zod';

@ApiTags('posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new post' })
  @ApiBody({ type: CreatePostDto })
  @ApiResponse({
    status: 201,
    description: 'Post created successfully',
    schema: {
      example: {
        id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        content: 'Just completed my 10K run! Feeling amazing 🏃‍♂️💪',
        type: 'achievement',
        visibility: 'public',
        media_urls: ['https://example.com/workout-photo.jpg'],
        tags: ['#fitness', '#running', '#health'],
        metadata: {
          workout_type: 'running',
          distance_km: 10,
          duration_minutes: 45,
          calories_burned: 650
        },
        likes_count: 0,
        comments_count: 0,
        shares_count: 0,
        user_id: 'user-uuid-here',
        created_at: '2025-06-25T12:00:00.000Z'
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @UsePipes(new ZodValidationPipe(createPostSchema))
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createPostDto: CreatePostDto) {
    return await this.postsService.create(createPostDto);
  }

  @Get('public')
  @ApiOperation({ summary: 'Get all public posts' })
  @ApiQuery({ name: 'page', description: 'Page number', required: false, example: 1 })
  @ApiQuery({ name: 'limit', description: 'Items per page', required: false, example: 20 })
  @ApiQuery({ 
    name: 'type', 
    description: 'Filter by post type', 
    required: false, 
    enum: PostType 
  })
  @ApiResponse({
    status: 200,
    description: 'List of public posts',
    schema: {
      example: {
        posts: [
          {
            id: 'post-uuid-1',
            content: 'Great workout today! 💪',
            type: 'achievement',
            visibility: 'public',
            media_urls: ['https://example.com/photo.jpg'],
            tags: ['#fitness', '#workout'],
            likes_count: 15,
            comments_count: 3,
            shares_count: 2,
            user: {
              id: 'user-uuid',
              name: 'John Doe',
              profile_image: 'https://example.com/profile.jpg'
            },
            created_at: '2025-06-25T12:00:00.000Z'
          }
        ],
        total: 50,
        page: 1,
        limit: 20,
        total_pages: 3
      }
    }
  })
  async findPublicPosts(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Query('type') type?: PostType,
  ) {
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    return await this.postsService.findPublicPosts(pageNum, limitNum, type);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get posts by a specific user' })
  @ApiParam({ name: 'userId', description: 'User ID (UUID)', type: 'string' })
  @ApiQuery({ name: 'page', description: 'Page number', required: false, example: 1 })
  @ApiQuery({ name: 'limit', description: 'Items per page', required: false, example: 20 })
  @ApiQuery({ name: 'requesterId', description: 'ID of user making request (for privacy)', required: false })
  @ApiResponse({
    status: 200,
    description: 'List of user posts',
    schema: {
      example: {
        posts: [
          {
            id: 'post-uuid-1',
            content: 'My personal fitness journey continues...',
            type: 'progress',
            visibility: 'public',
            likes_count: 8,
            comments_count: 2,
            user: {
              id: 'user-uuid',
              name: 'John Doe',
              profile_image: 'https://example.com/profile.jpg'
            },
            created_at: '2025-06-25T12:00:00.000Z'
          }
        ],
        total: 12,
        page: 1,
        limit: 20,
        total_pages: 1
      }
    }
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findUserPosts(
    @Param('userId') userId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Query('requesterId') requesterId?: string,
  ) {
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    return await this.postsService.findUserPosts(userId, pageNum, limitNum, requesterId);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search posts by content or tags' })
  @ApiQuery({ name: 'q', description: 'Search query', required: true, example: 'fitness workout' })
  @ApiQuery({ name: 'page', description: 'Page number', required: false, example: 1 })
  @ApiQuery({ name: 'limit', description: 'Items per page', required: false, example: 20 })
  @ApiResponse({
    status: 200,
    description: 'Search results',
    schema: {
      example: {
        posts: [
          {
            id: 'post-uuid-1',
            content: 'Amazing fitness workout today! #fitness #workout',
            type: 'workout',
            visibility: 'public',
            tags: ['#fitness', '#workout'],
            likes_count: 20,
            user: {
              id: 'user-uuid',
              name: 'Fitness Coach',
              profile_image: 'https://example.com/coach.jpg'
            },
            created_at: '2025-06-25T12:00:00.000Z'
          }
        ],
        total: 25,
        page: 1,
        limit: 20,
        total_pages: 2
      }
    }
  })
  async searchPosts(
    @Query('q') query: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    return await this.postsService.searchPosts(query, pageNum, limitNum);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get post by ID' })
  @ApiParam({ name: 'id', description: 'Post ID (UUID)', type: 'string' })
  @ApiQuery({ name: 'requesterId', description: 'ID of user making request (for privacy)', required: false })
  @ApiResponse({
    status: 200,
    description: 'Post details with comments and likes',
    schema: {
      example: {
        id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        content: 'Just completed my 10K run! Feeling amazing 🏃‍♂️💪',
        type: 'achievement',
        visibility: 'public',
        media_urls: ['https://example.com/workout-photo.jpg'],
        tags: ['#fitness', '#running', '#health'],
        metadata: {
          workout_type: 'running',
          distance_km: 10,
          duration_minutes: 45,
          calories_burned: 650
        },
        likes_count: 25,
        comments_count: 8,
        shares_count: 3,
        user: {
          id: 'user-uuid',
          name: 'John Doe',
          profile_image: 'https://example.com/profile.jpg'
        },
        comments: [
          {
            id: 'comment-uuid-1',
            content: 'Amazing achievement! Keep it up! 👏',
            likes_count: 5,
            user: {
              id: 'commenter-uuid',
              name: 'Jane Smith',
              profile_image: 'https://example.com/jane.jpg'
            },
            created_at: '2025-06-25T12:30:00.000Z'
          }
        ],
        likes: [
          {
            id: 'like-uuid-1',
            user: {
              id: 'liker-uuid',
              name: 'Mike Johnson'
            },
            created_at: '2025-06-25T12:15:00.000Z'
          }
        ],
        created_at: '2025-06-25T12:00:00.000Z'
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Post not found' })
  @ApiResponse({ status: 403, description: 'Access denied to private post' })
  @UsePipes(new ZodValidationPipe(getPostByIdSchema))
  async findOne(
    @Param() params: { id: string },
    @Query('requesterId') requesterId?: string,
  ) {
    return await this.postsService.findOne(params.id, requesterId);
  }

  @Post('like')
  @ApiOperation({ summary: 'Like or unlike a post' })
  @ApiBody({ type: LikePostDto })
  @ApiResponse({
    status: 200,
    description: 'Post like/unlike successful',
    schema: {
      example: {
        message: 'Post liked successfully',
        liked: true
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Post or user not found' })
  @UsePipes(new ZodValidationPipe(likePostSchema))
  async likePost(@Body() likePostDto: LikePostDto) {
    return await this.postsService.likePost(likePostDto);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get post engagement statistics' })
  @ApiParam({ name: 'id', description: 'Post ID (UUID)', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Post engagement statistics',
    schema: {
      example: {
        likes_count: 25,
        comments_count: 8,
        shares_count: 3,
        engagement_rate: 95.5
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Post not found' })
  async getPostStats(@Param('id') postId: string) {
    return await this.postsService.getPostStats(postId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update post by ID' })
  @ApiParam({ name: 'id', description: 'Post ID (UUID)', type: 'string' })
  @ApiBody({ type: UpdatePostDto })
  @ApiQuery({ name: 'requesterId', description: 'ID of user making request', required: true })
  @ApiResponse({
    status: 200,
    description: 'Post updated successfully',
    schema: {
      example: {
        id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        content: 'Updated: Just completed my 10K run! Feeling amazing and ready for more challenges! 🏃‍♂️💪✨',
        type: 'achievement',
        visibility: 'public',
        tags: ['#fitness', '#running', '#health', '#marathon-training'],
        likes_count: 25,
        updated_at: '2025-06-25T13:00:00.000Z'
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Post not found' })
  @ApiResponse({ status: 403, description: 'Access denied - not post owner' })
  @UsePipes(new ZodValidationPipe(getPostByIdSchema))
  async update(
    @Param() params: { id: string },
    @Body(new ZodValidationPipe(updatePostSchema)) updatePostDto: UpdatePostDto,
    @Query('requesterId') requesterId: string,
  ) {
    return await this.postsService.update(params.id, updatePostDto, requesterId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete post by ID' })
  @ApiParam({ name: 'id', description: 'Post ID (UUID)', type: 'string' })
  @ApiQuery({ name: 'requesterId', description: 'ID of user making request', required: true })
  @ApiResponse({ status: 204, description: 'Post deleted successfully' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  @ApiResponse({ status: 403, description: 'Access denied - not post owner' })
  @UsePipes(new ZodValidationPipe(getPostByIdSchema))
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param() params: { id: string },
    @Query('requesterId') requesterId: string,
  ): Promise<void> {
    await this.postsService.remove(params.id, requesterId);
  }
}
