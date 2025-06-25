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
import { RemindersService } from './reminders.service';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { UpdateReminderDto, UpdateReminderStatusDto } from './dto/update-reminder.dto';
import { ReminderType, ReminderFrequency, ReminderStatus } from './entities/reminder.entity';
import { ZodValidationPipe } from '../../shared/pipes/zod-validation.pipe';
import {
  createReminderSchema,
  updateReminderSchema,
  getReminderByIdSchema,
  getRemindersByUserSchema,
  updateReminderStatusSchema,
} from './dto/reminder.zod';

@ApiTags('reminders')
@Controller('reminders')
export class RemindersController {
  constructor(private readonly remindersService: RemindersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new reminder' })
  @ApiBody({ type: CreateReminderDto })
  @ApiResponse({
    status: 201,
    description: 'Reminder created successfully',
    schema: {
      example: {
        id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        title: 'Take Vitamin D',
        description: 'Take 1000IU Vitamin D supplement with breakfast',
        type: 'medication',
        frequency: 'daily',
        time: '08:30',
        start_date: '2025-06-25',
        end_date: null,
        custom_schedule: null,
        status: 'active',
        is_notification_enabled: true,
        metadata: {
          medication_name: 'Vitamin D3',
          dosage: '1000IU',
          instructions: 'Take with food'
        },
        user_id: 'user-uuid-here',
        created_at: '2025-06-25T12:00:00.000Z',
        updated_at: '2025-06-25T12:00:00.000Z'
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 409, description: 'Date validation failed' })
  @UsePipes(new ZodValidationPipe(createReminderSchema))
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createReminderDto: CreateReminderDto) {
    return await this.remindersService.create(createReminderDto);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get reminders for a specific user' })
  @ApiParam({ name: 'userId', description: 'User ID (UUID)', type: 'string' })
  @ApiQuery({ name: 'page', description: 'Page number', required: false, example: 1 })
  @ApiQuery({ name: 'limit', description: 'Items per page', required: false, example: 20 })
  @ApiQuery({ 
    name: 'status', 
    description: 'Filter by reminder status', 
    required: false, 
    enum: ReminderStatus 
  })
  @ApiQuery({ 
    name: 'type', 
    description: 'Filter by reminder type', 
    required: false, 
    enum: ReminderType 
  })
  @ApiResponse({
    status: 200,
    description: 'List of reminders for the user',
    schema: {
      example: {
        reminders: [
          {
            id: 'reminder-uuid-1',
            title: 'Take Vitamin D',
            description: 'Daily vitamin supplement',
            type: 'medication',
            frequency: 'daily',
            time: '08:30',
            start_date: '2025-06-25',
            end_date: null,
            status: 'active',
            is_notification_enabled: true,
            metadata: { medication_name: 'Vitamin D3', dosage: '1000IU' },
            user_id: 'user-uuid',
            created_at: '2025-06-25T12:00:00.000Z'
          }
        ],
        total: 15,
        page: 1,
        limit: 20,
        total_pages: 1
      }
    }
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @UsePipes(new ZodValidationPipe(getRemindersByUserSchema))
  async findByUser(
    @Param() params: { userId: string },
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Query('status') status?: ReminderStatus,
    @Query('type') type?: ReminderType,
  ) {
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    return await this.remindersService.findByUser(params.userId, pageNum, limitNum, status, type);
  }

  @Get('user/:userId/stats')
  @ApiOperation({ summary: 'Get reminder statistics for a user' })
  @ApiParam({ name: 'userId', description: 'User ID (UUID)', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Reminder statistics',
    schema: {
      example: {
        total_reminders: 25,
        active_reminders: 20,
        completed_reminders: 3,
        by_type: {
          medication: 10,
          exercise: 5,
          meal: 4,
          water: 3,
          sleep: 2,
          appointment: 1
        },
        by_frequency: {
          daily: 18,
          weekly: 4,
          monthly: 2,
          once: 1
        }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getStats(@Param('userId') userId: string) {
    return await this.remindersService.getStats(userId);
  }

  @Get('user/:userId/upcoming')
  @ApiOperation({ summary: 'Get upcoming reminders for a user' })
  @ApiParam({ name: 'userId', description: 'User ID (UUID)', type: 'string' })
  @ApiQuery({ name: 'hours', description: 'Time horizon in hours', required: false, example: 24 })
  @ApiResponse({
    status: 200,
    description: 'List of upcoming reminders',
    schema: {
      example: [
        {
          id: 'reminder-uuid-1',
          title: 'Morning Exercise',
          description: '30 minutes cardio workout',
          type: 'exercise',
          frequency: 'daily',
          time: '07:00',
          status: 'active',
          is_notification_enabled: true,
          metadata: { workout_type: 'cardio', duration_minutes: 30 },
          user_id: 'user-uuid',
          created_at: '2025-06-25T12:00:00.000Z'
        }
      ]
    }
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findUpcoming(
    @Param('userId') userId: string,
    @Query('hours') hours: string = '24'
  ) {
    const hoursNum = parseInt(hours) || 24;
    return await this.remindersService.findUpcomingReminders(userId, hoursNum);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get reminder by ID' })
  @ApiParam({ name: 'id', description: 'Reminder ID (UUID)', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Reminder found',
    schema: {
      example: {
        id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        title: 'Take Vitamin D',
        description: 'Take 1000IU Vitamin D supplement with breakfast',
        type: 'medication',
        frequency: 'daily',
        time: '08:30',
        start_date: '2025-06-25',
        end_date: null,
        custom_schedule: null,
        status: 'active',
        is_notification_enabled: true,
        metadata: {
          medication_name: 'Vitamin D3',
          dosage: '1000IU',
          instructions: 'Take with food'
        },
        user_id: 'user-uuid-here',
        user: {
          id: 'user-uuid-here',
          name: 'John Doe',
          email: 'john@example.com'
        },
        created_at: '2025-06-25T12:00:00.000Z',
        updated_at: '2025-06-25T12:00:00.000Z'
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Reminder not found' })
  @UsePipes(new ZodValidationPipe(getReminderByIdSchema))
  async findOne(@Param() params: { id: string }) {
    return await this.remindersService.findOne(params.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update reminder by ID' })
  @ApiParam({ name: 'id', description: 'Reminder ID (UUID)', type: 'string' })
  @ApiBody({ type: UpdateReminderDto })
  @ApiResponse({
    status: 200,
    description: 'Reminder updated successfully',
    schema: {
      example: {
        id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        title: 'Take Vitamin D3',
        description: 'Take 2000IU Vitamin D supplement with breakfast',
        type: 'medication',
        frequency: 'daily',
        time: '09:00',
        start_date: '2025-06-25',
        end_date: null,
        status: 'active',
        is_notification_enabled: true,
        metadata: {
          medication_name: 'Vitamin D3',
          dosage: '2000IU',
          instructions: 'Take with morning meal'
        },
        user_id: 'user-uuid-here',
        created_at: '2025-06-25T12:00:00.000Z',
        updated_at: '2025-06-25T13:00:00.000Z'
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Reminder not found' })
  @ApiResponse({ status: 409, description: 'Date validation failed' })
  @UsePipes(new ZodValidationPipe(getReminderByIdSchema))
  async update(
    @Param() params: { id: string },
    @Body(new ZodValidationPipe(updateReminderSchema)) updateReminderDto: UpdateReminderDto,
  ) {
    return await this.remindersService.update(params.id, updateReminderDto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update reminder status' })
  @ApiParam({ name: 'id', description: 'Reminder ID (UUID)', type: 'string' })
  @ApiBody({ type: UpdateReminderStatusDto })
  @ApiResponse({
    status: 200,
    description: 'Reminder status updated successfully',
    schema: {
      example: {
        id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        title: 'Take Vitamin D',
        status: 'completed',
        updated_at: '2025-06-25T14:00:00.000Z'
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Reminder not found' })
  @UsePipes(new ZodValidationPipe(getReminderByIdSchema))
  async updateStatus(
    @Param() params: { id: string },
    @Body(new ZodValidationPipe(updateReminderStatusSchema)) updateStatusDto: UpdateReminderStatusDto,
  ) {
    return await this.remindersService.updateStatus(params.id, updateStatusDto);
  }

  @Post(':id/snooze')
  @ApiOperation({ summary: 'Snooze a reminder for specified minutes' })
  @ApiParam({ name: 'id', description: 'Reminder ID (UUID)', type: 'string' })
  @ApiQuery({ name: 'minutes', description: 'Snooze duration in minutes', example: 15 })
  @ApiResponse({
    status: 200,
    description: 'Reminder snoozed successfully',
    schema: {
      example: {
        id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        title: 'Take Vitamin D',
        status: 'active',
        metadata: {
          medication_name: 'Vitamin D3',
          dosage: '1000IU',
          snoozed_until: '2025-06-25T14:15:00.000Z',
          snooze_count: 1
        },
        updated_at: '2025-06-25T14:00:00.000Z'
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Reminder not found' })
  @UsePipes(new ZodValidationPipe(getReminderByIdSchema))
  async snoozeReminder(
    @Param() params: { id: string },
    @Query('minutes') minutes: string = '15'
  ) {
    const minutesNum = parseInt(minutes) || 15;
    return await this.remindersService.snoozeReminder(params.id, minutesNum);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete reminder by ID' })
  @ApiParam({ name: 'id', description: 'Reminder ID (UUID)', type: 'string' })
  @ApiResponse({ status: 204, description: 'Reminder deleted successfully' })
  @ApiResponse({ status: 404, description: 'Reminder not found' })
  @UsePipes(new ZodValidationPipe(getReminderByIdSchema))
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param() params: { id: string }): Promise<void> {
    await this.remindersService.remove(params.id);
  }
}
