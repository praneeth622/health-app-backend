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
import { CommentsService } from './comments.service';
import { CreateCommentDto, UpdateCommentDto, GetCommentByIdDto, GetCommentsByPostDto, CommentResponseDto } from './dto/comment.dto';
import { ZodValidationPipe } from '../../shared/pipes/zod-validation.pipe';
import {
  createCommentSchema,
  updateCommentSchema,
  getCommentByIdSchema,
  getCommentsByPostSchema,
} from './dto/comment.zod';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createCommentSchema))
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createCommentDto: CreateCommentDto): Promise<CommentResponseDto> {
    const comment = await this.commentsService.create(createCommentDto);
    return this.mapToResponseDto(comment);
  }

  @Get('post/:postId')
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
  @UsePipes(new ZodValidationPipe(getCommentByIdSchema))
  async findOne(@Param() params: GetCommentByIdDto): Promise<CommentResponseDto> {
    const comment = await this.commentsService.findOne(params.id);
    return this.mapToResponseDto(comment);
  }

  @Patch(':id')
  @UsePipes(new ZodValidationPipe(getCommentByIdSchema))
  async update(
    @Param() params: GetCommentByIdDto,
    @Body(new ZodValidationPipe(updateCommentSchema)) updateCommentDto: UpdateCommentDto,
  ): Promise<CommentResponseDto> {
    const comment = await this.commentsService.update(params.id, updateCommentDto);
    return this.mapToResponseDto(comment);
  }

  @Delete(':id')
  @UsePipes(new ZodValidationPipe(getCommentByIdSchema))
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param() params: GetCommentByIdDto): Promise<void> {
    await this.commentsService.remove(params.id);
  }

  @Post(':id/like')
  @UsePipes(new ZodValidationPipe(getCommentByIdSchema))
  async likeComment(@Param() params: GetCommentByIdDto): Promise<CommentResponseDto> {
    const comment = await this.commentsService.incrementLikes(params.id);
    return this.mapToResponseDto(comment);
  }

  @Delete(':id/like')
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
