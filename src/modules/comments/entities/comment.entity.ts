import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Post } from '../../posts/entities/post.entity';

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'json', nullable: true })
  media_urls: string[]; // images, gifs, etc.

  @Column({ type: 'int', default: 0 })
  likes_count: number;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

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

  // Self-referencing for replies
  @ManyToOne(() => Comment, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'parent_comment_id' })
  parent_comment: Comment;

  @Column({ type: 'uuid', nullable: true })
  parent_comment_id: string;

  @OneToMany(() => Comment, (comment) => comment.parent_comment)
  replies: Comment[];

  @OneToMany(() => CommentLike, (like) => like.comment)
  likes: CommentLike[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

@Entity('comment_likes')
export class CommentLike {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Comment, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'comment_id' })
  comment: Comment;

  @Column({ type: 'uuid' })
  comment_id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'uuid' })
  user_id: string;

  @CreateDateColumn()
  created_at: Date;
}
