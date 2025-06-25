import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Comment } from '../../comments/entities/comment.entity';

export enum PostType {
  TEXT = 'text',
  IMAGE = 'image',
  VIDEO = 'video',
  ACHIEVEMENT = 'achievement',
  WORKOUT = 'workout',
  MEAL = 'meal',
  PROGRESS = 'progress'
}

export enum PostVisibility {
  PUBLIC = 'public',
  FRIENDS = 'friends',
  PRIVATE = 'private'
}

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'enum', enum: PostType, default: PostType.TEXT })
  type: PostType;

  @Column({ type: 'enum', enum: PostVisibility, default: PostVisibility.PUBLIC })
  visibility: PostVisibility;

  @Column({ type: 'json', nullable: true })
  media_urls: string[]; // images, videos, etc.

  @Column({ type: 'json', nullable: true })
  tags: string[]; // hashtags, user mentions

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>; // workout details, meal info, etc.

  @Column({ type: 'int', default: 0 })
  likes_count: number;

  @Column({ type: 'int', default: 0 })
  comments_count: number;

  @Column({ type: 'int', default: 0 })
  shares_count: number;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'uuid' })
  user_id: string;

  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[];

  @OneToMany(() => PostLike, (like) => like.post)
  likes: PostLike[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

@Entity('post_likes')
export class PostLike {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Post, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_id' })
  post: Post;

  @Column({ type: 'uuid' })
  post_id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'uuid' })
  user_id: string;

  @CreateDateColumn()
  created_at: Date;
}
