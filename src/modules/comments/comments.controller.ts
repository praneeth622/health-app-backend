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
import { CommentsService } from './comments.service';
import { CreateCommentDto, UpdateCommentDto, GetCommentByIdDto, GetCommentsByPostDto, CommentResponseDto } from './dto/comment.dto';
import { ZodValidationPipe } from '../../shared/pipes/zod-validation.pipe';
import {
  createCommentSchema,
  updateCommentSchema,
  getCommentByIdSchema,
  getCommentsByPostSchema,
} from './dto/comment.zod';

@ApiTags('comments')
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new comment' })
  @ApiBody({ type: CreateCommentDto })
  @ApiResponse({
    status: 201,
    description: 'Comment created successfully',
    type: CommentResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'Post or user not found' })
  @UsePipes(new ZodValidationPipe(createCommentSchema))
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createCommentDto: CreateCommentDto): Promise<CommentResponseDto> {
    const comment = await this.commentsService.create(createCommentDto);
    return this.mapToResponseDto(comment);
  }

  @Get('post/:postId')
  @ApiOperation({ summary: 'Get comments for a specific post' })
  @ApiParam({ name: 'postId', description: 'Post ID (UUID)', type: 'string' })
  @ApiQuery({ name: 'page', description: 'Page number', required: false, example: 1 })
  @ApiQuery({ name: 'limit', description: 'Items per page', required: false, example: 50 })
  @ApiResponse({
    status: 200,
    description: 'List of comments for the post',
    schema: {
      example: {
        comments: [
          {
            id: 'comment-uuid-1',
            content: 'Great workout! Keep it up! 💪',
            likes_count: 5,
            user: {
              id: 'user-uuid',
              name: 'John Doe',
              profile_image: 'https://example.com/profile.jpg'
            },
            created_at: '2025-06-25T12:30:00.000Z'
          }
        ],
        total: 25,
        page: 1,
        limit: 50,
        total_pages: 1
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Post not found' })
  @UsePipes(new ZodValidationPipe(getCommentsByPostSchema))
  async findByPost(
    @Param() params: GetCommentsByPostDto,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '50'
  ) {
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 50;
    
    const result = await this.commentsService.findByPost(params.postId, pageNum, limitNum);
    
    return {
      ...result,
      comments: result.comments.map(comment => this.mapToResponseDto(comment))
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get comment by ID' })
  @ApiParam({ name: 'id', description: 'Comment ID (UUID)', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Comment details',
    type: CommentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  @UsePipes(new ZodValidationPipe(getCommentByIdSchema))
  async findOne(@Param() params: GetCommentByIdDto): Promise<CommentResponseDto> {
    const comment = await this.commentsService.findOne(params.id);
    return this.mapToResponseDto(comment);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update comment by ID' })
  @ApiParam({ name: 'id', description: 'Comment ID (UUID)', type: 'string' })
  @ApiBody({ type: UpdateCommentDto })
  @ApiQuery({ name: 'requesterId', description: 'ID of user making request', required: true })
  @ApiResponse({
    status: 200,
    description: 'Comment updated successfully',
    type: CommentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  @ApiResponse({ status: 403, description: 'Access denied - not comment owner' })
  @UsePipes(new ZodValidationPipe(getCommentByIdSchema))
  async update(
    @Param() params: GetCommentByIdDto,
    @Body(new ZodValidationPipe(updateCommentSchema)) updateCommentDto: UpdateCommentDto,
    @Query('requesterId') requesterId: string,
  ): Promise<CommentResponseDto> {
    const comment = await this.commentsService.update(params.id, updateCommentDto, requesterId);
    return this.mapToResponseDto(comment);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete comment by ID' })
  @ApiParam({ name: 'id', description: 'Comment ID (UUID)', type: 'string' })
  @ApiQuery({ name: 'requesterId', description: 'ID of user making request', required: true })
  @ApiResponse({ status: 204, description: 'Comment deleted successfully' })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  @ApiResponse({ status: 403, description: 'Access denied - not comment owner' })
  @UsePipes(new ZodValidationPipe(getCommentByIdSchema))
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param() params: GetCommentByIdDto,
    @Query('requesterId') requesterId: string,
  ): Promise<void> {
    await this.commentsService.remove(params.id, requesterId);
  }

  @Post(':id/like')
  @ApiOperation({ summary: 'Like a comment (increment likes)' })
  @ApiParam({ name: 'id', description: 'Comment ID (UUID)', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Comment liked successfully',
    type: CommentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  @UsePipes(new ZodValidationPipe(getCommentByIdSchema))
  async likeComment(@Param() params: GetCommentByIdDto): Promise<CommentResponseDto> {
    const comment = await this.commentsService.incrementLikes(params.id);
    return this.mapToResponseDto(comment);
  }

  @Delete(':id/like')
  @ApiOperation({ summary: 'Unlike a comment (decrement likes)' })
  @ApiParam({ name: 'id', description: 'Comment ID (UUID)', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Comment unliked successfully',
    type: CommentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  @UsePipes(new ZodValidationPipe(getCommentByIdSchema))
  async unlikeComment(@Param() params: GetCommentByIdDto): Promise<CommentResponseDto> {
    const comment = await this.commentsService.decrementLikes(params.id);
    return this.mapToResponseDto(comment);
  }

  private mapToResponseDto(comment: any): CommentResponseDto {
    return {
      id: comment.id,
      content: comment.content,
      likes_count: comment.likes_count,
      is_active: comment.is_active,
      user_id: comment.user_id,
      post_id: comment.post_id,
      parent_comment_id: comment.parent_comment_id,
      user: comment.user ? {
        id: comment.user.id,
        name: comment.user.name,
        profile_image: comment.user.profile_image,
      } : undefined,
      created_at: comment.created_at,
      updated_at: comment.updated_at,
    };
  }
}
