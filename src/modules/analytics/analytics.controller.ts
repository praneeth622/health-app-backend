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
import { AnalyticsService } from './analytics.service';
import {
  CreateAnalyticsDto,
  UpdateAnalyticsDto,
  GetAnalyticsDto,
  GetUserAnalyticsDto,
  DashboardSummaryDto,
  CreateDashboardSettingsDto,
} from './dto/analytics.dto';
import { AnalyticsType, PeriodType } from './entities/analytics.entity';
import { ZodValidationPipe } from '../../shared/pipes/zod-validation.pipe';
import {
  createAnalyticsSchema,
  updateAnalyticsSchema,
  getAnalyticsByIdSchema,
  getUserAnalyticsSchema,
  dashboardSummarySchema,
  createDashboardSettingsSchema,
} from './dto/analytics.zod';

@ApiTags('analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post()
  @ApiOperation({ summary: 'Create new analytics entry' })
  @ApiBody({ type: CreateAnalyticsDto })
  @ApiResponse({
    status: 201,
    description: 'Analytics created successfully',
    schema: {
      example: {
        id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        type: 'weight_tracking',
        period_type: 'weekly',
        period_start: '2025-06-18',
        period_end: '2025-06-25',
        metrics: {
          average_weight: 70.5,
          weight_change: -1.2,
          measurements_count: 7,
          trend: 'decreasing'
        },
        insights: {
          summary: 'Great progress this week! You lost 1.2kg consistently.',
          recommendations: ['Continue current diet plan', 'Add 30min cardio'],
          achievements: ['Weekly weight loss goal achieved']
        },
        score: 85.5,
        user_id: 'user-uuid-here',
        created_at: '2025-06-25T12:00:00.000Z'
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @UsePipes(new ZodValidationPipe(createAnalyticsSchema))
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createAnalyticsDto: CreateAnalyticsDto) {
    return await this.analyticsService.create(createAnalyticsDto);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get analytics for a specific user' })
  @ApiParam({ name: 'userId', description: 'User ID (UUID)', type: 'string' })
  @ApiQuery({ 
    name: 'type', 
    description: 'Filter by analytics type', 
    required: false, 
    enum: AnalyticsType 
  })
  @ApiQuery({ 
    name: 'period', 
    description: 'Filter by period type', 
    required: false, 
    enum: PeriodType 
  })
  @ApiQuery({ name: 'startDate', description: 'Start date filter', required: false, type: 'string', format: 'date' })
  @ApiQuery({ name: 'endDate', description: 'End date filter', required: false, type: 'string', format: 'date' })
  @ApiQuery({ name: 'page', description: 'Page number', required: false, example: 1 })
  @ApiQuery({ name: 'limit', description: 'Items per page', required: false, example: 20 })
  @ApiResponse({
    status: 200,
    description: 'User analytics data',
    schema: {
      example: {
        analytics: [
          {
            id: 'analytics-uuid-1',
            type: 'weight_tracking',
            period_type: 'weekly',
            metrics: {
              average_weight: 70.5,
              weight_change: -1.2,
              trend: 'decreasing'
            },
            score: 85.5,
            created_at: '2025-06-25T12:00:00.000Z'
          }
        ],
        total: 25,
        page: 1,
        limit: 20,
        total_pages: 2
      }
    }
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @UsePipes(new ZodValidationPipe(getUserAnalyticsSchema))
  async findUserAnalytics(
    @Param() params: GetUserAnalyticsDto,
    @Query('type') type?: AnalyticsType,
    @Query('period') periodType?: PeriodType,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    return await this.analyticsService.findUserAnalytics(
      params.userId,
      type,
      periodType,
      start,
      end,
      pageNum,
      limitNum,
    );
  }

  @Get('dashboard/:userId')
  @ApiOperation({ summary: 'Get dashboard summary for user' })
  @ApiParam({ name: 'userId', description: 'User ID (UUID)', type: 'string' })
  @ApiQuery({ 
    name: 'period', 
    description: 'Time period for summary', 
    required: false, 
    enum: PeriodType,
    example: PeriodType.WEEKLY 
  })
  @ApiResponse({
    status: 200,
    description: 'Dashboard summary data',
    schema: {
      example: {
        overview: {
          total_analytics: 15,
          average_score: 82.5,
          weight_trend: 'decreasing',
          workouts_completed: 12
        },
        charts: {
          weight_chart: [
            { date: '2025-06-18', weight: 71.7, change: -0.3 },
            { date: '2025-06-25', weight: 70.5, change: -1.2 }
          ],
          workout_chart: [
            { date: '2025-06-18', workouts: 3, duration: 150, calories: 450 },
            { date: '2025-06-25', workouts: 4, duration: 180, calories: 520 }
          ],
          score_trend: [
            { date: '2025-06-18', score: 78, type: 'weight_tracking' },
            { date: '2025-06-25', score: 85, type: 'weight_tracking' }
          ]
        },
        goals: {
          weight_loss: { target: 5, achieved: 1.2, percentage: 24 },
          workout_frequency: { target: 5, achieved: 4, percentage: 80 },
          sleep_hours: { target: 8, achieved: 7.5, percentage: 94 }
        },
        insights: [
          'Great progress this week! You lost 1.2kg consistently.',
          'Your workout consistency improved by 20% this week.'
        ],
        achievements: [
          'Weekly weight loss goal achieved',
          '7-day tracking streak achieved!'
        ]
      }
    }
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @UsePipes(new ZodValidationPipe(dashboardSummarySchema))
  async getDashboardSummary(
    @Param() params: DashboardSummaryDto,
    @Query('period') period?: PeriodType,
  ) {
    return await this.analyticsService.getDashboardSummary(
      params.userId,
      period || PeriodType.WEEKLY,
    );
  }

  @Post('generate/weight/:userId')
  @ApiOperation({ summary: 'Generate weight analytics for user' })
  @ApiParam({ name: 'userId', description: 'User ID (UUID)', type: 'string' })
  @ApiResponse({
    status: 201,
    description: 'Weight analytics generated successfully',
    schema: {
      example: {
        id: 'analytics-uuid',
        type: 'weight_tracking',
        period_type: 'weekly',
        metrics: {
          average_weight: 70.5,
          weight_change: -1.2,
          measurements_count: 7,
          trend: 'decreasing',
          min_weight: 70.1,
          max_weight: 71.8
        },
        insights: {
          summary: 'Great progress! You lost 1.2kg this week.',
          recommendations: ['Continue current nutrition plan', 'Maintain exercise routine'],
          achievements: ['7-day tracking streak achieved!', 'Weekly weight loss goal achieved']
        },
        score: 85,
        created_at: '2025-06-25T12:00:00.000Z'
      }
    }
  })
  @ApiResponse({ status: 404, description: 'User not found or no weight data available' })
  @HttpCode(HttpStatus.CREATED)
  async generateWeightAnalytics(@Param('userId') userId: string) {
    return await this.analyticsService.generateWeightAnalytics(userId);
  }

  @Get('settings/:userId')
  @ApiOperation({ summary: 'Get user dashboard settings' })
  @ApiParam({ name: 'userId', description: 'User ID (UUID)', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'User dashboard settings',
    schema: {
      example: {
        id: 'settings-uuid',
        widget_preferences: {
          weight_chart: { enabled: true, position: 1 },
          workout_summary: { enabled: true, position: 2 },
          goals_progress: { enabled: true, position: 3 },
          recent_activities: { enabled: true, position: 4 }
        },
        chart_preferences: {
          weight_chart_type: 'line',
          workout_chart_type: 'bar',
          show_trends: true,
          show_goals: true
        },
        notification_preferences: {
          weekly_summary: true,
          goal_achievements: true,
          milestone_alerts: true,
          trend_insights: true
        },
        theme: 'light',
        units_preference: 'metric',
        user_id: 'user-uuid',
        created_at: '2025-06-25T12:00:00.000Z'
      }
    }
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getDashboardSettings(@Param('userId') userId: string) {
    return await this.analyticsService.getUserDashboardSettings(userId);
  }

  @Post('settings')
  @ApiOperation({ summary: 'Create or update dashboard settings' })
  @ApiBody({ type: CreateDashboardSettingsDto })
  @ApiResponse({
    status: 200,
    description: 'Dashboard settings saved successfully',
    schema: {
      example: {
        id: 'settings-uuid',
        widget_preferences: {
          weight_chart: { enabled: true, position: 1 },
          workout_summary: { enabled: false, position: 2 }
        },
        chart_preferences: {
          weight_chart_type: 'area',
          show_trends: true
        },
        theme: 'dark',
        units_preference: 'imperial',
        updated_at: '2025-06-25T13:00:00.000Z'
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @UsePipes(new ZodValidationPipe(createDashboardSettingsSchema))
  async createDashboardSettings(@Body() createDto: CreateDashboardSettingsDto) {
    return await this.analyticsService.createDashboardSettings(createDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get analytics by ID' })
  @ApiParam({ name: 'id', description: 'Analytics ID (UUID)', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Analytics details',
    schema: {
      example: {
        id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        type: 'weight_tracking',
        period_type: 'weekly',
        period_start: '2025-06-18',
        period_end: '2025-06-25',
        metrics: {
          average_weight: 70.5,
          weight_change: -1.2,
          measurements_count: 7,
          trend: 'decreasing'
        },
        insights: {
          summary: 'Great progress this week!',
          recommendations: ['Continue current plan'],
          achievements: ['Goal achieved']
        },
        score: 85.5,
        user: {
          id: 'user-uuid',
          name: 'John Doe',
          profile_image: 'https://example.com/profile.jpg'
        },
        created_at: '2025-06-25T12:00:00.000Z'
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Analytics not found' })
  @UsePipes(new ZodValidationPipe(getAnalyticsByIdSchema))
  async findOne(@Param() params: GetAnalyticsDto) {
    return await this.analyticsService.findOne(params.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update analytics by ID' })
  @ApiParam({ name: 'id', description: 'Analytics ID (UUID)', type: 'string' })
  @ApiBody({ type: UpdateAnalyticsDto })
  @ApiResponse({
    status: 200,
    description: 'Analytics updated successfully',
    schema: {
      example: {
        id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        metrics: {
          average_weight: 70.2,
          weight_change: -1.5,
          measurements_count: 8,
          trend: 'decreasing'
        },
        score: 92.0,
        updated_at: '2025-06-25T13:00:00.000Z'
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Analytics not found' })
  @UsePipes(new ZodValidationPipe(getAnalyticsByIdSchema))
  async update(
    @Param() params: GetAnalyticsDto,
    @Body(new ZodValidationPipe(updateAnalyticsSchema)) updateAnalyticsDto: UpdateAnalyticsDto,
  ) {
    return await this.analyticsService.update(params.id, updateAnalyticsDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete analytics by ID' })
  @ApiParam({ name: 'id', description: 'Analytics ID (UUID)', type: 'string' })
  @ApiResponse({ status: 204, description: 'Analytics deleted successfully' })
  @ApiResponse({ status: 404, description: 'Analytics not found' })
  @UsePipes(new ZodValidationPipe(getAnalyticsByIdSchema))
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param() params: GetAnalyticsDto): Promise<void> {
    await this.analyticsService.remove(params.id);
  }
}