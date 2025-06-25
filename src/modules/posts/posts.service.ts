import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { CreatePostDto, UpdatePostDto } from './dto/post.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    private readonly usersService: UsersService,
  ) {}

  async create(createPostDto: CreatePostDto): Promise<Post> {
    // Validate user exists
    await this.usersService.findOne(createPostDto.user_id);

    const post = this.postRepository.create(createPostDto);
    return await this.postRepository.save(post);
  }

  async findAll(page: number = 1, limit: number = 20): Promise<{ posts: Post[]; total: number; page: number; totalPages: number }> {
    const skip = (page - 1) * limit;
    
    const [posts, total] = await this.postRepository.findAndCount({
      relations: ['user'],
      select: {
        user: {
          id: true,
          name: true,
          profile_image: true,
        }
      },
      where: { is_active: true },
      order: { created_at: 'DESC' },
      take: limit,
      skip,
    });

    return {
      posts,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Post> {
    const post = await this.postRepository.findOne({
      where: { id, is_active: true },
      relations: ['user', 'comments'],
      select: {
        user: {
          id: true,
          name: true,
          profile_image: true,
        }
      }
    });

    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    return post;
  }

  async findByUser(userId: string, page: number = 1, limit: number = 20): Promise<{ posts: Post[]; total: number; page: number; totalPages: number }> {
    // Validate user exists
    await this.usersService.findOne(userId);

    const skip = (page - 1) * limit;
    
    const [posts, total] = await this.postRepository.findAndCount({
      where: { user_id: userId, is_active: true },
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
      posts,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async update(id: string, updatePostDto: UpdatePostDto, userId?: string): Promise<Post> {
    const post = await this.findOne(id);

    // Check if user owns the post (if userId is provided for authorization)
    if (userId && post.user_id !== userId) {
      throw new ForbiddenException('You can only update your own posts');
    }

    Object.assign(post, updatePostDto);
    return await this.postRepository.save(post);
  }

  async remove(id: string, userId?: string): Promise<void> {
    const post = await this.findOne(id);

    // Check if user owns the post (if userId is provided for authorization)
    if (userId && post.user_id !== userId) {
      throw new ForbiddenException('You can only delete your own posts');
    }

    // Soft delete by setting is_active to false
    post.is_active = false;
    await this.postRepository.save(post);
  }

  async incrementLikes(id: string): Promise<Post> {
    const post = await this.findOne(id);
    post.likes_count += 1;
    return await this.postRepository.save(post);
  }

  async decrementLikes(id: string): Promise<Post> {
    const post = await this.findOne(id);
    if (post.likes_count > 0) {
      post.likes_count -= 1;
    }
    return await this.postRepository.save(post);
  }

  async incrementCommentsCount(id: string): Promise<void> {
    await this.postRepository.increment({ id }, 'comments_count', 1);
  }

  async decrementCommentsCount(id: string): Promise<void> {
    await this.postRepository.decrement({ id }, 'comments_count', 1);
  }
}
