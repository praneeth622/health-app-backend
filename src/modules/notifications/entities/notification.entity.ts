import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn, Index } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum NotificationType {
  REMINDER = 'reminder',
  ACHIEVEMENT = 'achievement',
  CHALLENGE_INVITE = 'challenge_invite',
  CHALLENGE_UPDATE = 'challenge_update',
  SOCIAL_ACTIVITY = 'social_activity',
  HEALTH_INSIGHT = 'health_insight',
  GOAL_MILESTONE = 'goal_milestone',
  SYSTEM_UPDATE = 'system_update',
  FRIEND_REQUEST = 'friend_request',
  POST_LIKE = 'post_like',
  POST_COMMENT = 'post_comment'
}

export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export enum DeliveryChannel {
  IN_APP = 'in_app',
  EMAIL = 'email',
  PUSH = 'push',
  SMS = 'sms'
}

@Entity('notifications')
@Index(['user_id', 'read_at', 'created_at'])
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'enum', enum: NotificationType })
  type: NotificationType;

  @Column({ type: 'enum', enum: NotificationPriority, default: NotificationPriority.MEDIUM })
  priority: NotificationPriority;

  @Column({ type: 'json', nullable: true })
  data: Record<string, any>; // Additional context data

  @Column({ type: 'varchar', length: 500, nullable: true })
  action_url: string; // Deep link or URL for action

  @Column({ type: 'varchar', length: 200, nullable: true })
  action_text: string; // Text for action button

  @Column({ type: 'varchar', length: 500, nullable: true })
  image_url: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  category: string; // For grouping notifications

  @Column({ type: 'timestamp', nullable: true })
  read_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  delivered_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  clicked_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  scheduled_for: Date; // For scheduled notifications

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'uuid' })
  user_id: string;

  // Optional: For tracking who triggered the notification
  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'triggered_by_user_id' })
  triggered_by_user: User;

  @Column({ type: 'uuid', nullable: true })
  triggered_by_user_id: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

@Entity('notification_preferences')
export class NotificationPreference {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: NotificationType })
  notification_type: NotificationType;

  @Column({ type: 'enum', enum: DeliveryChannel })
  delivery_channel: DeliveryChannel;

  @Column({ type: 'boolean', default: true })
  is_enabled: boolean;

  @Column({ type: 'json', nullable: true })
  settings: Record<string, any>; // Channel-specific settings

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

@Entity('notification_delivery_logs')
export class NotificationDeliveryLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: DeliveryChannel })
  delivery_channel: DeliveryChannel;

  @Column({ type: 'varchar', length: 50 })
  status: string; // sent, delivered, failed, opened

  @Column({ type: 'text', nullable: true })
  error_message: string;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>; // Provider-specific data

  @ManyToOne(() => Notification, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'notification_id' })
  notification: Notification;

  @Column({ type: 'uuid' })
  notification_id: string;

  @CreateDateColumn()
  created_at: Date;
}