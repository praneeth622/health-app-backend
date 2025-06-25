import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Comment, CommentLike } from './entities/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto, LikeCommentDto } from './dto/update-comment.dto';
import { UsersService } from '../users/users.service';
import { PostsService } from '../posts/posts.service';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(CommentLike)
    private readonly commentLikeRepository: Repository<CommentLike>,
    private readonly usersService: UsersService,
    private readonly postsService: PostsService,
  ) {}

  async create(createCommentDto: CreateCommentDto): Promise<Comment> {
    // Validate user and post exist
    await this.usersService.findOne(createCommentDto.user_id);
    await this.postsService.findOne(createCommentDto.post_id);

    // If it's a reply, validate parent comment exists
    if (createCommentDto.parent_comment_id) {
      await this.findOne(createCommentDto.parent_comment_id);
    }

    const comment = this.commentRepository.create(createCommentDto);
    const savedComment = await this.commentRepository.save(comment);

    // Update post comments count
    await this.updatePostCommentsCount(createCommentDto.post_id);

    return savedComment;
  }

  async findByPost(
    postId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ comments: Comment[]; total: number; page: number; limit: number; total_pages: number }> {
    // Validate post exists
    await this.postsService.findOne(postId);

    const skip = (page - 1) * limit;

    const [comments, total] = await this.commentRepository.findAndCount({
      where: { 
        post_id: postId,
        parent_comment_id: IsNull(), // Only top-level comments
        is_active: true,
      },
      relations: ['user', 'replies', 'replies.user'],
      select: {
        user: {
          id: true,
          name: true,
          profile_image: true,
        },
        replies: {
          id: true,
          content: true,
          likes_count: true,
          created_at: true,
          user: {
            id: true,
            name: true,
            profile_image: true,
          }
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
      limit,
      total_pages: Math.ceil(total / limit),
    };
  }

  async findReplies(
    commentId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ replies: Comment[]; total: number; page: number; limit: number; total_pages: number }> {
    // Validate parent comment exists
    await this.findOne(commentId);

    const skip = (page - 1) * limit;

    const [replies, total] = await this.commentRepository.findAndCount({
      where: { 
        parent_comment_id: commentId,
        is_active: true,
      },
      relations: ['user'],
      select: {
        user: {
          id: true,
          name: true,
          profile_image: true,
        }
      },
      order: { created_at: 'ASC' },
      take: limit,
      skip,
    });

    return {
      replies,
      total,
      page,
      limit,
      total_pages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Comment> {
    const comment = await this.commentRepository.findOne({
      where: { id },
      relations: ['user', 'post', 'parent_comment', 'replies', 'likes'],
      select: {
        user: {
          id: true,
          name: true,
          profile_image: true,
        },
        post: {
          id: true,
          content: true,
          user_id: true,
        },
        parent_comment: {
          id: true,
          content: true,
          user: {
            id: true,
            name: true,
          }
        },
        replies: {
          id: true,
          content: true,
          likes_count: true,
          created_at: true,
          user: {
            id: true,
            name: true,
          }
        },
        likes: {
          id: true,
          user: {
            id: true,
            name: true,
          }
        }
      }
    });

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }

    return comment;
  }

  async update(id: string, updateCommentDto: UpdateCommentDto, requesterId: string): Promise<Comment> {
    const comment = await this.findOne(id);

    // Only the comment owner can update
    if (comment.user_id !== requesterId) {
      throw new ForbiddenException('You can only update your own comments');
    }

    Object.assign(comment, updateCommentDto);
    return await this.commentRepository.save(comment);
  }

  // Add these missing methods for the controller
  async incrementLikes(id: string): Promise<Comment> {
    const comment = await this.findOne(id);
    comment.likes_count += 1;
    return await this.commentRepository.save(comment);
  }

  async decrementLikes(id: string): Promise<Comment> {
    const comment = await this.findOne(id);
    comment.likes_count = Math.max(0, comment.likes_count - 1);
    return await this.commentRepository.save(comment);
  }

  async likeComment(likeCommentDto: LikeCommentDto): Promise<{ message: string; liked: boolean }> {
    const { commentId, userId } = likeCommentDto;

    // Validate user exists
    await this.usersService.findOne(userId);

    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${commentId} not found`);
    }

    // Check if user already liked this comment
    const existingLike = await this.commentLikeRepository.findOne({
      where: { comment_id: commentId, user_id: userId },
    });

    if (existingLike) {
      // Unlike the comment
      await this.commentLikeRepository.remove(existingLike);
      comment.likes_count = Math.max(0, comment.likes_count - 1);
      await this.commentRepository.save(comment);
      return { message: 'Comment unliked successfully', liked: false };
    } else {
      // Like the comment
      const like = this.commentLikeRepository.create({
        comment_id: commentId,
        user_id: userId,
      });
      await this.commentLikeRepository.save(like);
      comment.likes_count += 1;
      await this.commentRepository.save(comment);
      return { message: 'Comment liked successfully', liked: true };
    }
  }

  async remove(id: string, requesterId: string): Promise<void> {
    const comment = await this.findOne(id);

    // Only the comment owner can delete
    if (comment.user_id !== requesterId) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    await this.commentRepository.remove(comment);

    // Update post comments count
    await this.updatePostCommentsCount(comment.post_id);
  }

  private async updatePostCommentsCount(postId: string): Promise<void> {
    const commentsCount = await this.commentRepository.count({
      where: { post_id: postId, is_active: true },
    });

    // You'll need to add this method to PostsService or handle it differently
    // For now, we'll skip the update to avoid circular dependency
  }
}
