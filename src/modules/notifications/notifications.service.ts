import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, IsNull, In } from 'typeorm';
import { 
  Notification, 
  NotificationPreference, 
  NotificationDeliveryLog,
  NotificationType,
  NotificationPriority,
  DeliveryChannel
} from './entities/notification.entity';
import { 
  CreateNotificationDto, 
  UpdateNotificationDto, 
  CreateNotificationPreferenceDto,
  BulkNotificationDto
} from './dto/notification.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @InjectRepository(NotificationPreference)
    private readonly notificationPreferenceRepository: Repository<NotificationPreference>,
    @InjectRepository(NotificationDeliveryLog)
    private readonly deliveryLogRepository: Repository<NotificationDeliveryLog>,
    private readonly usersService: UsersService,
  ) {}

  async create(createNotificationDto: CreateNotificationDto): Promise<Notification> {
    // Validate user exists
    await this.usersService.findOne(createNotificationDto.user_id);

    // Validate triggered_by_user if provided
    if (createNotificationDto.triggered_by_user_id) {
      await this.usersService.findOne(createNotificationDto.triggered_by_user_id);
    }

    const notification = this.notificationRepository.create(createNotificationDto);

    // Set delivered_at if not scheduled
    if (!createNotificationDto.scheduled_for) {
      notification.delivered_at = new Date();
    }

    return await this.notificationRepository.save(notification);
  }

  async findUserNotifications(
    userId: string,
    page: number = 1,
    limit: number = 20,
    unreadOnly: boolean = false,
    category?: string,
  ): Promise<{
    notifications: Notification[];
    total: number;
    unread_count: number;
    page: number;
    limit: number;
    total_pages: number;
  }> {
    // Validate user exists
    await this.usersService.findOne(userId);

    const skip = (page - 1) * limit;
    const whereCondition: any = { 
      user_id: userId,
      is_active: true,
    };

    if (unreadOnly) {
      whereCondition.read_at = IsNull();
    }

    if (category) {
      whereCondition.category = category;
    }

    // Get scheduled notifications that should be delivered
    await this.deliverScheduledNotifications();

    const [notifications, total] = await this.notificationRepository.findAndCount({
      where: whereCondition,
      relations: ['triggered_by_user'],
      select: {
        triggered_by_user: {
          id: true,
          name: true,
          profile_image: true,
        }
      },
      order: { created_at: 'DESC' },
      take: limit,
      skip,
    });

    // Get unread count
    const unread_count = await this.notificationRepository.count({
      where: { 
        user_id: userId,
        is_active: true,
        read_at: IsNull(),
      },
    });

    return {
      notifications,
      total,
      unread_count,
      page,
      limit,
      total_pages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id },
      relations: ['user', 'triggered_by_user'],
      select: {
        user: {
          id: true,
          name: true,
          profile_image: true,
        },
        triggered_by_user: {
          id: true,
          name: true,
          profile_image: true,
        }
      }
    });

    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }

    return notification;
  }

  async update(id: string, updateNotificationDto: UpdateNotificationDto): Promise<Notification> {
    const notification = await this.findOne(id);

    // Handle special update cases
    if (updateNotificationDto.mark_as_read) {
      notification.read_at = new Date();
    }

    if (updateNotificationDto.mark_as_clicked) {
      notification.clicked_at = new Date();
      if (!notification.read_at) {
        notification.read_at = new Date();
      }
    }

    // Update other fields
    Object.assign(notification, updateNotificationDto);
    
    return await this.notificationRepository.save(notification);
  }

  async markAsRead(notificationId: string): Promise<Notification> {
    return await this.update(notificationId, { mark_as_read: true });
  }

  async markAllAsRead(userId: string): Promise<{ updated_count: number }> {
    await this.usersService.findOne(userId);

    const result = await this.notificationRepository.update(
      { 
        user_id: userId,
        read_at: IsNull(),
        is_active: true,
      },
      { read_at: new Date() }
    );

    return { updated_count: result.affected || 0 };
  }

  async createBulkNotifications(bulkDto: BulkNotificationDto): Promise<{ created_count: number }> {
    // Validate all users exist
    for (const userId of bulkDto.user_ids) {
      await this.usersService.findOne(userId);
    }

    // Validate triggered_by_user if provided
    if (bulkDto.triggered_by_user_id) {
      await this.usersService.findOne(bulkDto.triggered_by_user_id);
    }

    const notifications = bulkDto.user_ids.map(userId => 
      this.notificationRepository.create({
        title: bulkDto.title,
        message: bulkDto.message,
        type: bulkDto.type,
        data: bulkDto.data,
        action_url: bulkDto.action_url,
        user_id: userId,
        triggered_by_user_id: bulkDto.triggered_by_user_id,
        delivered_at: new Date(),
      })
    );

    const savedNotifications = await this.notificationRepository.save(notifications);
    
    return { created_count: savedNotifications.length };
  }

  async remove(id: string): Promise<void> {
    const notification = await this.findOne(id);
    await this.notificationRepository.remove(notification);
  }

  // Notification Preferences
  async createNotificationPreference(createDto: CreateNotificationPreferenceDto): Promise<NotificationPreference> {
    await this.usersService.findOne(createDto.user_id);

    // Check if preference already exists
    const existing = await this.notificationPreferenceRepository.findOne({
      where: {
        user_id: createDto.user_id,
        notification_type: createDto.notification_type,
        delivery_channel: createDto.delivery_channel,
      },
    });

    if (existing) {
      // Update existing preference
      Object.assign(existing, createDto);
      return await this.notificationPreferenceRepository.save(existing);
    }

    const preference = this.notificationPreferenceRepository.create(createDto);
    return await this.notificationPreferenceRepository.save(preference);
  }

  async getUserNotificationPreferences(userId: string): Promise<NotificationPreference[]> {
    await this.usersService.findOne(userId);

    return await this.notificationPreferenceRepository.find({
      where: { user_id: userId },
      order: { notification_type: 'ASC', delivery_channel: 'ASC' },
    });
  }

  async updateNotificationPreference(
    userId: string,
    notificationType: NotificationType,
    deliveryChannel: DeliveryChannel,
    isEnabled: boolean,
    settings?: Record<string, any>,
  ): Promise<NotificationPreference> {
    await this.usersService.findOne(userId);

    const preference = await this.notificationPreferenceRepository.findOne({
      where: {
        user_id: userId,
        notification_type: notificationType,
        delivery_channel: deliveryChannel,
      },
    });

    if (!preference) {
      // Create new preference
      return await this.createNotificationPreference({
        user_id: userId,
        notification_type: notificationType,
        delivery_channel: deliveryChannel,
        is_enabled: isEnabled,
        settings,
      });
    }

    preference.is_enabled = isEnabled;
    if (settings) {
      preference.settings = settings;
    }

    return await this.notificationPreferenceRepository.save(preference);
  }

  // Utility Methods
  async getNotificationStats(userId: string): Promise<{
    total_notifications: number;
    unread_notifications: number;
    notifications_by_type: Record<string, number>;
    recent_activity: boolean;
  }> {
    await this.usersService.findOne(userId);

    const total_notifications = await this.notificationRepository.count({
      where: { user_id: userId, is_active: true },
    });

    const unread_notifications = await this.notificationRepository.count({
      where: { 
        user_id: userId, 
        is_active: true,
        read_at: IsNull(),
      },
    });

    // Get notifications by type
    const typeStats = await this.notificationRepository
      .createQueryBuilder('notification')
      .select('notification.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .where('notification.user_id = :userId', { userId })
      .andWhere('notification.is_active = :isActive', { isActive: true })
      .groupBy('notification.type')
      .getRawMany();

    const notifications_by_type = typeStats.reduce((acc, stat) => {
      acc[stat.type] = parseInt(stat.count);
      return acc;
    }, {});

    // Check for recent activity (last 24 hours)
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recent_count = await this.notificationRepository.count({
      where: {
        user_id: userId,
        is_active: true,
        created_at: LessThanOrEqual(yesterday),
      },
    });

    return {
      total_notifications,
      unread_notifications,
      notifications_by_type,
      recent_activity: recent_count > 0,
    };
  }

  private async deliverScheduledNotifications(): Promise<void> {
    const now = new Date();
    
    // Find notifications scheduled for delivery
    const scheduledNotifications = await this.notificationRepository.find({
      where: {
        scheduled_for: LessThanOrEqual(now),
        delivered_at: IsNull(),
        is_active: true,
      },
    });

    if (scheduledNotifications.length > 0) {
      // Mark as delivered
      for (const notification of scheduledNotifications) {
        notification.delivered_at = now;
      }
      
      await this.notificationRepository.save(scheduledNotifications);
    }
  }

  // Quick notification creators for common use cases
  async createWorkoutReminder(userId: string, workoutData: any): Promise<Notification> {
    return await this.create({
      title: 'Workout Reminder',
      message: `Time for your ${workoutData.type} workout! 💪`,
      type: NotificationType.REMINDER,
      priority: NotificationPriority.MEDIUM,
      data: workoutData,
      action_url: `/app/workouts/start?id=${workoutData.workout_id}`,
      action_text: 'Start Workout',
      category: 'workouts',
      user_id: userId,
    });
  }

  async createAchievementNotification(userId: string, achievementData: any): Promise<Notification> {
    return await this.create({
      title: '🎉 Achievement Unlocked!',
      message: `Congratulations! You've earned: ${achievementData.title}`,
      type: NotificationType.ACHIEVEMENT,
      priority: NotificationPriority.HIGH,
      data: achievementData,
      action_url: `/app/achievements/${achievementData.id}`,
      action_text: 'View Achievement',
      category: 'achievements',
      user_id: userId,
    });
  }

  async createSocialNotification(
    userId: string, 
    triggeredByUserId: string, 
    socialData: any
  ): Promise<Notification> {
    return await this.create({
      title: 'Social Activity',
      message: socialData.message,
      type: NotificationType.SOCIAL_ACTIVITY,
      priority: NotificationPriority.LOW,
      data: socialData,
      action_url: socialData.action_url,
      action_text: socialData.action_text,
      category: 'social',
      user_id: userId,
      triggered_by_user_id: triggeredByUserId,
    });
  }
}