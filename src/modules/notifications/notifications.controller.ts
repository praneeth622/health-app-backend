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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import {
  CreateNotificationDto,
  UpdateNotificationDto,
  CreateNotificationPreferenceDto,
  BulkNotificationDto,
  GetNotificationDto,
  GetUserNotificationsDto,
} from './dto/notification.dto';
import { NotificationType, DeliveryChannel } from './entities/notification.entity';
import { ZodValidationPipe } from '../../shared/pipes/zod-validation.pipe';
import {
  createNotificationSchema,
  updateNotificationSchema,
  createNotificationPreferenceSchema,
  bulkNotificationSchema,
  getNotificationSchema,
  getUserNotificationsSchema,
} from './dto/notification.zod';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new notification' })
  @ApiBody({ type: CreateNotificationDto })
  @ApiResponse({ status: 201, description: 'Notification created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @UsePipes(new ZodValidationPipe(createNotificationSchema))
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createNotificationDto: CreateNotificationDto) {
    return await this.notificationsService.create(createNotificationDto);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Send notifications to multiple users' })
  @ApiBody({ type: BulkNotificationDto })
  @ApiResponse({ status: 201, description: 'Bulk notifications sent successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @UsePipes(new ZodValidationPipe(bulkNotificationSchema))
  @HttpCode(HttpStatus.CREATED)
  async createBulk(@Body() bulkNotificationDto: BulkNotificationDto) {
    return await this.notificationsService.createBulkNotifications(bulkNotificationDto);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get notifications for a user' })
  @ApiParam({ name: 'userId', description: 'User ID (UUID)' })
  @ApiQuery({ name: 'page', description: 'Page number', required: false, example: 1 })
  @ApiQuery({ name: 'limit', description: 'Items per page', required: false, example: 20 })
  @ApiQuery({ name: 'unreadOnly', description: 'Show only unread notifications', required: false, type: 'boolean' })
  @ApiQuery({ name: 'category', description: 'Filter by category', required: false })
  @ApiResponse({ status: 200, description: 'User notifications retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @UsePipes(new ZodValidationPipe(getUserNotificationsSchema))
  async findUserNotifications(
    @Param() params: GetUserNotificationsDto,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Query('unreadOnly') unreadOnly: string = 'false',
    @Query('category') category?: string,
  ) {
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    const unreadOnlyBool = unreadOnly === 'true';

    return await this.notificationsService.findUserNotifications(
      params.userId,
      pageNum,
      limitNum,
      unreadOnlyBool,
      category,
    );
  }

  @Get('stats/:userId')
  @ApiOperation({ summary: 'Get notification statistics for user' })
  @ApiParam({ name: 'userId', description: 'User ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Notification statistics retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @UsePipes(new ZodValidationPipe(getUserNotificationsSchema))
  async getNotificationStats(@Param() params: GetUserNotificationsDto) {
    return await this.notificationsService.getNotificationStats(params.userId);
  }

  @Post('preferences')
  @ApiOperation({ summary: 'Create or update notification preference' })
  @ApiBody({ type: CreateNotificationPreferenceDto })
  @ApiResponse({ status: 200, description: 'Notification preference saved successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @UsePipes(new ZodValidationPipe(createNotificationPreferenceSchema))
  async createNotificationPreference(@Body() createDto: CreateNotificationPreferenceDto) {
    return await this.notificationsService.createNotificationPreference(createDto);
  }

  @Get('preferences/:userId')
  @ApiOperation({ summary: 'Get user notification preferences' })
  @ApiParam({ name: 'userId', description: 'User ID (UUID)' })
  @ApiResponse({ status: 200, description: 'User preferences retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @UsePipes(new ZodValidationPipe(getUserNotificationsSchema))
  async getUserNotificationPreferences(@Param() params: GetUserNotificationsDto) {
    return await this.notificationsService.getUserNotificationPreferences(params.userId);
  }

  @Patch('preferences/:userId/:type/:channel')
  @ApiOperation({ summary: 'Update specific notification preference' })
  @ApiParam({ name: 'userId', description: 'User ID (UUID)' })
  @ApiParam({ name: 'type', description: 'Notification type', enum: NotificationType })
  @ApiParam({ name: 'channel', description: 'Delivery channel', enum: DeliveryChannel })
  @ApiQuery({ name: 'enabled', description: 'Enable/disable preference', type: 'boolean' })
  @ApiResponse({ status: 200, description: 'Preference updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateNotificationPreference(
    @Param('userId') userId: string,
    @Param('type') type: NotificationType,
    @Param('channel') channel: DeliveryChannel,
    @Query('enabled') enabled: string = 'true',
    @Body() settings?: Record<string, any>,
  ) {
    const isEnabled = enabled === 'true';
    return await this.notificationsService.updateNotificationPreference(
      userId,
      type,
      channel,
      isEnabled,
      settings,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get notification by ID' })
  @ApiParam({ name: 'id', description: 'Notification ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Notification retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  @UsePipes(new ZodValidationPipe(getNotificationSchema))
  async findOne(@Param() params: GetNotificationDto) {
    return await this.notificationsService.findOne(params.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update notification' })
  @ApiParam({ name: 'id', description: 'Notification ID (UUID)' })
  @ApiBody({ type: UpdateNotificationDto })
  @ApiResponse({ status: 200, description: 'Notification updated successfully' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  @UsePipes(new ZodValidationPipe(getNotificationSchema))
  async update(
    @Param() params: GetNotificationDto,
    @Body(new ZodValidationPipe(updateNotificationSchema)) updateDto: UpdateNotificationDto,
  ) {
    return await this.notificationsService.update(params.id, updateDto);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiParam({ name: 'id', description: 'Notification ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Notification marked as read' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  @UsePipes(new ZodValidationPipe(getNotificationSchema))
  async markAsRead(@Param() params: GetNotificationDto) {
    return await this.notificationsService.markAsRead(params.id);
  }

  @Patch('user/:userId/read-all')
  @ApiOperation({ summary: 'Mark all notifications as read for user' })
  @ApiParam({ name: 'userId', description: 'User ID (UUID)' })
  @ApiResponse({ status: 200, description: 'All notifications marked as read' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @UsePipes(new ZodValidationPipe(getUserNotificationsSchema))
  async markAllAsRead(@Param() params: GetUserNotificationsDto) {
    return await this.notificationsService.markAllAsRead(params.userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete notification' })
  @ApiParam({ name: 'id', description: 'Notification ID (UUID)' })
  @ApiResponse({ status: 204, description: 'Notification deleted successfully' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  @UsePipes(new ZodValidationPipe(getNotificationSchema))
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param() params: GetNotificationDto): Promise<void> {
    await this.notificationsService.remove(params.id);
  }

  // Quick notification endpoints
  @Post('workout-reminder/:userId')
  @ApiOperation({ summary: 'Send workout reminder to user' })
  @ApiParam({ name: 'userId', description: 'User ID (UUID)' })
  @ApiResponse({ status: 201, description: 'Workout reminder sent successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @HttpCode(HttpStatus.CREATED)
  async sendWorkoutReminder(
    @Param('userId') userId: string,
    @Body() workoutData: any,
  ) {
    return await this.notificationsService.createWorkoutReminder(userId, workoutData);
  }

  @Post('achievement/:userId')
  @ApiOperation({ summary: 'Send achievement notification to user' })
  @ApiParam({ name: 'userId', description: 'User ID (UUID)' })
  @ApiResponse({ status: 201, description: 'Achievement notification sent successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @HttpCode(HttpStatus.CREATED)
  async sendAchievementNotification(
    @Param('userId') userId: string,
    @Body() achievementData: any,
  ) {
    return await this.notificationsService.createAchievementNotification(userId, achievementData);
  }

  @Post('social/:userId')
  @ApiOperation({ summary: 'Send social activity notification' })
  @ApiParam({ name: 'userId', description: 'User ID (UUID)' })
  @ApiQuery({ name: 'triggeredBy', description: 'User who triggered this notification' })
  @ApiResponse({ status: 201, description: 'Social notification sent successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @HttpCode(HttpStatus.CREATED)
  async sendSocialNotification(
    @Param('userId') userId: string,
    @Query('triggeredBy') triggeredByUserId: string,
    @Body() socialData: any,
  ) {
    return await this.notificationsService.createSocialNotification(
      userId,
      triggeredByUserId,
      socialData,
    );
  }
}