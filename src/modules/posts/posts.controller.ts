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
import { PostsService } from './posts.service';
import { CreatePostDto, UpdatePostDto, GetPostByIdDto, GetPostsByUserDto, PostResponseDto } from './dto/post.dto';
import { ZodValidationPipe } from '../../shared/pipes/zod-validation.pipe';
import {
  createPostSchema,
  updatePostSchema,
  getPostByIdSchema,
  getPostsByUserSchema,
} from './dto/post.zod';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createPostSchema))
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createPostDto: CreatePostDto): Promise<PostResponseDto> {
    const post = await this.postsService.create(createPostDto);
    return this.mapToResponseDto(post);
  }

  @Get()
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20'
  ) {
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    
    const result = await this.postsService.findAll(pageNum, limitNum);
    
    return {
      ...result,
      posts: result.posts.map(post => this.mapToResponseDto(post))
    };
  }

  @Get('user/:userId')
  @UsePipes(new ZodValidationPipe(getPostsByUserSchema))
  async findByUser(
    @Param() params: GetPostsByUserDto,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20'
  ) {
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    
    const result = await this.postsService.findByUser(params.userId, pageNum, limitNum);
    
    return {
      ...result,
      posts: result.posts.map(post => this.mapToResponseDto(post))
    };
  }

  @Get(':id')
  @UsePipes(new ZodValidationPipe(getPostByIdSchema))
  async findOne(@Param() params: GetPostByIdDto): Promise<PostResponseDto> {
    const post = await this.postsService.findOne(params.id);
    return this.mapToResponseDto(post);
  }

  @Patch(':id')
  @UsePipes(new ZodValidationPipe(getPostByIdSchema))
  async update(
    @Param() params: GetPostByIdDto,
    @Body(new ZodValidationPipe(updatePostSchema)) updatePostDto: UpdatePostDto,
  ): Promise<PostResponseDto> {
    const post = await this.postsService.update(params.id, updatePostDto);
    return this.mapToResponseDto(post);
  }

  @Delete(':id')
  @UsePipes(new ZodValidationPipe(getPostByIdSchema))
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param() params: GetPostByIdDto): Promise<void> {
    await this.postsService.remove(params.id);
  }

  @Post(':id/like')
  @UsePipes(new ZodValidationPipe(getPostByIdSchema))
  async likePost(@Param() params: GetPostByIdDto): Promise<PostResponseDto> {
    const post = await this.postsService.incrementLikes(params.id);
    return this.mapToResponseDto(post);
  }

  @Delete(':id/like')
  @UsePipes(new ZodValidationPipe(getPostByIdSchema))
  async unlikePost(@Param() params: GetPostByIdDto): Promise<PostResponseDto> {
    const post = await this.postsService.decrementLikes(params.id);
    return this.mapToResponseDto(post);
  }

  private mapToResponseDto(post: any): PostResponseDto {
    return {
      id: post.id,
      content: post.content,
      type: post.type,
      media_urls: post.media_urls,
      metadata: post.metadata,
      likes_count: post.likes_count,
      comments_count: post.comments_count,
      is_active: post.is_active,
      user_id: post.user_id,
      user: post.user ? {
        id: post.user.id,
        name: post.user.name,
        profile_image: post.user.profile_image,
      } : undefined,
      created_at: post.created_at,
      updated_at: post.updated_at,
    };
  }
}
