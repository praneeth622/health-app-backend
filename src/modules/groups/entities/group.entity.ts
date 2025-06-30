import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, JoinColumn, Index } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum GroupType {
  PUBLIC = 'public',
  PRIVATE = 'private',
  INVITE_ONLY = 'invite_only'
}

export enum GroupCategory {
  FITNESS = 'fitness',
  NUTRITION = 'nutrition',
  MENTAL_HEALTH = 'mental_health',
  WEIGHT_LOSS = 'weight_loss',
  MUSCLE_BUILDING = 'muscle_building',
  RUNNING = 'running',
  YOGA = 'yoga',
  GENERAL = 'general'
}

export enum MembershipRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  MEMBER = 'member'
}

export enum MembershipStatus {
  ACTIVE = 'active',
  PENDING = 'pending',
  BANNED = 'banned',
  LEFT = 'left'
}

@Entity('groups')
@Index(['type', 'category', 'is_active'])
export class Group {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'enum', enum: GroupType, default: GroupType.PUBLIC })
  type: GroupType;

  @Column({ type: 'enum', enum: GroupCategory, default: GroupCategory.GENERAL })
  category: GroupCategory;

  @Column({ type: 'varchar', length: 500, nullable: true })
  image_url?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  cover_image_url?: string;

  @Column({ type: 'json', nullable: true })
  rules?: string[];

  @Column({ type: 'json', nullable: true })
  tags?: string[];

  @Column({ type: 'int', default: 0 })
  member_count: number;

  @Column({ type: 'int', nullable: true })
  max_members?: number;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'boolean', default: false })
  is_featured: boolean;

  @Column({ type: 'json', nullable: true })
  settings?: Record<string, any>;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @Column({ type: 'uuid' })
  owner_id: string;

  @OneToMany(() => GroupMembership, membership => membership.group)
  memberships: GroupMembership[];

  @OneToMany(() => GroupPost, post => post.group)
  posts: GroupPost[];

  @OneToMany(() => GroupEvent, event => event.group)
  events: GroupEvent[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

@Entity('group_memberships')
@Index(['group_id', 'user_id'], { unique: true })
@Index(['user_id', 'status', 'role'])
export class GroupMembership {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: MembershipRole, default: MembershipRole.MEMBER })
  role: MembershipRole;

  @Column({ type: 'enum', enum: MembershipStatus, default: MembershipStatus.PENDING })
  status: MembershipStatus;

  // 🔧 Fix: Make joined_at properly nullable
  @Column({ type: 'timestamp', nullable: true })
  joined_at?: Date | null;

  @Column({ type: 'text', nullable: true })
  join_message?: string;

  @Column({ type: 'json', nullable: true })
  permissions?: Record<string, boolean>;

  @ManyToOne(() => Group, group => group.memberships, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'group_id' })
  group: Group;

  @Column({ type: 'uuid' })
  group_id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'uuid' })
  user_id: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

@Entity('group_posts')
@Index(['group_id', 'is_active', 'created_at'])
export class GroupPost {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'json', nullable: true })
  media_urls?: string[];

  @Column({ type: 'boolean', default: false })
  is_pinned: boolean;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'int', default: 0 })
  likes_count: number;

  @Column({ type: 'int', default: 0 })
  comments_count: number;

  @Column({ type: 'json', nullable: true })
  tags?: string[];

  @ManyToOne(() => Group, group => group.posts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'group_id' })
  group: Group;

  @Column({ type: 'uuid' })
  group_id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'author_id' })
  author: User;

  @Column({ type: 'uuid' })
  author_id: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

@Entity('group_events')
@Index(['group_id', 'start_date', 'is_active'])
export class GroupEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'timestamp' })
  start_date: Date;

  @Column({ type: 'timestamp', nullable: true })
  end_date?: Date;

  @Column({ type: 'varchar', length: 500, nullable: true })
  location?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  image_url?: string;

  @Column({ type: 'int', nullable: true })
  max_participants?: number;

  @Column({ type: 'int', default: 0 })
  participants_count: number;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'json', nullable: true })
  requirements?: string[];

  @ManyToOne(() => Group, group => group.events, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'group_id' })
  group: Group;

  @Column({ type: 'uuid' })
  group_id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organizer_id' })
  organizer: User;

  @Column({ type: 'uuid' })
  organizer_id: string;

  @OneToMany(() => GroupEventParticipant, participant => participant.event)
  participants: GroupEventParticipant[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

@Entity('group_event_participants')
@Index(['event_id', 'user_id'], { unique: true })
export class GroupEventParticipant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: ['going', 'maybe', 'not_going'], default: 'going' })
  status: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @ManyToOne(() => GroupEvent, event => event.participants, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'event_id' })
  event: GroupEvent;

  @Column({ type: 'uuid' })
  event_id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'uuid' })
  user_id: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
