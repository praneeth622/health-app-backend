import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Post, PostLike, PostVisibility } from './entities/post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto, LikePostDto } from './dto/update-post.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(PostLike)
    private readonly postLikeRepository: Repository<PostLike>,
    private readonly usersService: UsersService,
  ) {}

  async create(createPostDto: CreatePostDto): Promise<Post> {
    // Validate user exists
    await this.usersService.findOne(createPostDto.user_id);

    const post = this.postRepository.create(createPostDto);
    return await this.postRepository.save(post);
  }

  async findPublicPosts(
    page: number = 1,
    limit: number = 20,
    type?: string,
  ): Promise<{ posts: Post[]; total: number; page: number; limit: number; total_pages: number }> {
    const skip = (page - 1) * limit;
    const whereCondition: any = { 
      visibility: PostVisibility.PUBLIC,
      is_active: true,
    };

    if (type) whereCondition.type = type;

    const [posts, total] = await this.postRepository.findAndCount({
      where: whereCondition,
      relations: ['user', 'comments', 'likes'],
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
      posts,
      total,
      page,
      limit,
      total_pages: Math.ceil(total / limit),
    };
  }

  async findUserPosts(
    userId: string,
    page: number = 1,
    limit: number = 20,
    requesterId?: string,
  ): Promise<{ posts: Post[]; total: number; page: number; limit: number; total_pages: number }> {
    // Validate user exists
    await this.usersService.findOne(userId);

    const skip = (page - 1) * limit;
    const whereCondition: any = { 
      user_id: userId,
      is_active: true,
    };

    // If requester is not the post owner, only show public posts
    if (requesterId !== userId) {
      whereCondition.visibility = PostVisibility.PUBLIC;
    }

    const [posts, total] = await this.postRepository.findAndCount({
      where: whereCondition,
      relations: ['user', 'comments', 'likes'],
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
      posts,
      total,
      page,
      limit,
      total_pages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, requesterId?: string): Promise<Post> {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['user', 'comments', 'comments.user', 'likes', 'likes.user'],
      select: {
        user: {
          id: true,
          name: true,
          profile_image: true,
        },
        comments: {
          id: true,
          content: true,
          likes_count: true,
          created_at: true,
          user: {
            id: true,
            name: true,
            profile_image: true,
          }
        },
        likes: {
          id: true,
          created_at: true,
          user: {
            id: true,
            name: true,
          }
        }
      }
    });

    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    // Check visibility permissions
    if (post.visibility === PostVisibility.PRIVATE && requesterId !== post.user_id) {
      throw new ForbiddenException('You do not have permission to view this post');
    }

    return post;
  }

  async update(id: string, updatePostDto: UpdatePostDto, requesterId: string): Promise<Post> {
    const post = await this.findOne(id);

    // Only the post owner can update
    if (post.user_id !== requesterId) {
      throw new ForbiddenException('You can only update your own posts');
    }

    Object.assign(post, updatePostDto);
    return await this.postRepository.save(post);
  }

  async likePost(likePostDto: LikePostDto): Promise<{ message: string; liked: boolean }> {
    const { postId, userId } = likePostDto;

    // Validate user exists
    await this.usersService.findOne(userId);

    const post = await this.postRepository.findOne({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException(`Post with ID ${postId} not found`);
    }

    // Check if user already liked this post
    const existingLike = await this.postLikeRepository.findOne({
      where: { post_id: postId, user_id: userId },
    });

    if (existingLike) {
      // Unlike the post
      await this.postLikeRepository.remove(existingLike);
      post.likes_count = Math.max(0, post.likes_count - 1);
      await this.postRepository.save(post);
      return { message: 'Post unliked successfully', liked: false };
    } else {
      // Like the post
      const like = this.postLikeRepository.create({
        post_id: postId,
        user_id: userId,
      });
      await this.postLikeRepository.save(like);
      post.likes_count += 1;
      await this.postRepository.save(post);
      return { message: 'Post liked successfully', liked: true };
    }
  }

  async getPostStats(postId: string): Promise<{
    likes_count: number;
    comments_count: number;
    shares_count: number;
    engagement_rate: number;
  }> {
    const post = await this.findOne(postId);

    const totalEngagement = post.likes_count + post.comments_count + post.shares_count;
    const engagementRate = totalEngagement > 0 ? (totalEngagement / 100) * 100 : 0; // Simplified calculation

    return {
      likes_count: post.likes_count,
      comments_count: post.comments_count,
      shares_count: post.shares_count,
      engagement_rate: Math.round(engagementRate * 100) / 100,
    };
  }

  async remove(id: string, requesterId: string): Promise<void> {
    const post = await this.findOne(id);

    // Only the post owner can delete
    if (post.user_id !== requesterId) {
      throw new ForbiddenException('You can only delete your own posts');
    }

    await this.postRepository.remove(post);
  }

  async searchPosts(
    query: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ posts: Post[]; total: number; page: number; limit: number; total_pages: number }> {
    const skip = (page - 1) * limit;

    const [posts, total] = await this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .where('post.content ILIKE :query', { query: `%${query}%` })
      .orWhere('post.tags::text ILIKE :query', { query: `%${query}%` })
      .andWhere('post.visibility = :visibility', { visibility: PostVisibility.PUBLIC })
      .andWhere('post.is_active = :active', { active: true })
      .select([
        'post',
        'user.id', 'user.name', 'user.profile_image'
      ])
      .orderBy('post.created_at', 'DESC')
      .take(limit)
      .skip(skip)
      .getManyAndCount();

    return {
      posts,
      total,
      page,
      limit,
      total_pages: Math.ceil(total / limit),
    };
  }
}
