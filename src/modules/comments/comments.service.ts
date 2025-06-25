import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { CreateCommentDto, UpdateCommentDto } from './dto/comment.dto';
import { UsersService } from '../users/users.service';
import { PostsService } from '../posts/posts.service';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    private readonly usersService: UsersService,
    private readonly postsService: PostsService,
  ) {}

  async create(createCommentDto: CreateCommentDto): Promise<Comment> {
    // Validate user and post exist
    await this.usersService.findOne(createCommentDto.user_id);
    await this.postsService.findOne(createCommentDto.post_id);

    const comment = this.commentRepository.create(createCommentDto);
    const savedComment = await this.commentRepository.save(comment);

    // Increment post comment count
    await this.postsService.incrementCommentsCount(createCommentDto.post_id);

    return savedComment;
  }

  async findByPost(postId: string, page: number = 1, limit: number = 50): Promise<{ comments: Comment[]; total: number; page: number; totalPages: number }> {
    // Validate post exists
    await this.postsService.findOne(postId);

    const skip = (page - 1) * limit;
    
    const [comments, total] = await this.commentRepository.findAndCount({
      where: { post_id: postId, is_active: true },
      relations: ['user'],
      select: {
        user: {
          id: true,
          name: true,
          profile_image: true,
        }
      },
      order: { created_at: 'DESC' },
      take: limit,
      skip,
    });

    return {
      comments,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Comment> {
    const comment = await this.commentRepository.findOne({
      where: { id, is_active: true },
      relations: ['user', 'post'],
      select: {
        user: {
          id: true,
          name: true,
          profile_image: true,
        }
      }
    });

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }

    return comment;
  }

  async update(id: string, updateCommentDto: UpdateCommentDto, userId?: string): Promise<Comment> {
    const comment = await this.findOne(id);

    // Check if user owns the comment (if userId is provided for authorization)
    if (userId && comment.user_id !== userId) {
      throw new ForbiddenException('You can only update your own comments');
    }

    Object.assign(comment, updateCommentDto);
    return await this.commentRepository.save(comment);
  }

  async remove(id: string, userId?: string): Promise<void> {
    const comment = await this.findOne(id);

    // Check if user owns the comment (if userId is provided for authorization)
    if (userId && comment.user_id !== userId) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    // Soft delete by setting is_active to false
    comment.is_active = false;
    await this.commentRepository.save(comment);

    // Decrement post comment count
    await this.postsService.decrementCommentsCount(comment.post_id);
  }

  async incrementLikes(id: string): Promise<Comment> {
    const comment = await this.findOne(id);
    comment.likes_count += 1;
    return await this.commentRepository.save(comment);
  }

  async decrementLikes(id: string): Promise<Comment> {
    const comment = await this.findOne(id);
    if (comment.likes_count > 0) {
      comment.likes_count -= 1;
    }
    return await this.commentRepository.save(comment);
  }
}
