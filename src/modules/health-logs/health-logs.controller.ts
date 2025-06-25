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
import { HealthLogsService } from './health-logs.service';
import { CreateHealthLogDto } from './dto/create-health-log.dto';
import { UpdateHealthLogDto } from './dto/update-health-log.dto';
import { ZodValidationPipe } from '../../shared/pipes/zod-validation.pipe';
import {
  createHealthLogSchema,
  updateHealthLogSchema,
  getHealthLogByIdSchema,
  getHealthLogsByUserSchema,
  getHealthLogsByDateRangeSchema,
} from './dto/health-log.zod';

@ApiTags('health-logs')
@Controller('health-logs')
export class HealthLogsController {
  constructor(private readonly healthLogsService: HealthLogsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new health log entry' })
  @ApiBody({ type: CreateHealthLogDto })
  @ApiResponse({
    status: 201,
    description: 'Health log created successfully',
    schema: {
      example: {
        id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        user_id: 'user-uuid-here',
        date: '2025-06-25',
        calories: 2000,
        steps: 8500,
        hydration_ml: 2500,
        sleep_hours: 7.5,
        vitamin_summary: 'Vitamin D3 1000IU, Omega-3',
        additional_metrics: { weight_kg: 70.5, mood: 'good' },
        created_at: '2025-06-25T12:00:00.000Z'
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 409, description: 'Health log already exists for this date' })
  @UsePipes(new ZodValidationPipe(createHealthLogSchema))
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createHealthLogDto: CreateHealthLogDto) {
    return await this.healthLogsService.create(createHealthLogDto);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get health logs for a specific user' })
  @ApiParam({ name: 'userId', description: 'User ID (UUID)', type: 'string' })
  @ApiQuery({ name: 'page', description: 'Page number', required: false, example: 1 })
  @ApiQuery({ name: 'limit', description: 'Items per page', required: false, example: 20 })
  @ApiResponse({
    status: 200,
    description: 'List of health logs for the user',
    schema: {
      example: {
        health_logs: [
          {
            id: 'log-uuid-1',
            user_id: 'user-uuid',
            date: '2025-06-25',
            calories: 2000,
            steps: 8500,
            hydration_ml: 2500,
            sleep_hours: 7.5,
            vitamin_summary: 'Vitamin D3 1000IU',
            additional_metrics: { weight_kg: 70.5 },
            created_at: '2025-06-25T12:00:00.000Z'
          }
        ],
        total: 45,
        page: 1,
        limit: 20,
        total_pages: 3
      }
    }
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @UsePipes(new ZodValidationPipe(getHealthLogsByUserSchema))
  async findByUser(
    @Param() params: { userId: string },
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20'
  ) {
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    return await this.healthLogsService.findByUser(params.userId, pageNum, limitNum);
  }

  @Get('user/:userId/stats')
  @ApiOperation({ summary: 'Get health statistics for a user within a date range' })
  @ApiParam({ name: 'userId', description: 'User ID (UUID)', type: 'string' })
  @ApiQuery({ name: 'startDate', description: 'Start date (YYYY-MM-DD)', example: '2025-06-01' })
  @ApiQuery({ name: 'endDate', description: 'End date (YYYY-MM-DD)', example: '2025-06-30' })
  @ApiResponse({
    status: 200,
    description: 'Health statistics for the specified period',
    schema: {
      example: {
        avg_calories: 2150.5,
        avg_steps: 8750.2,
        avg_hydration_ml: 2400.8,
        avg_sleep_hours: 7.3,
        total_entries: 30,
        date_range: {
          start_date: '2025-06-01',
          end_date: '2025-06-30'
        }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getStats(
    @Param('userId') userId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return await this.healthLogsService.getStats(userId, startDate, endDate);
  }

  @Get('user/:userId/range')
  @ApiOperation({ summary: 'Get health logs for a user within a specific date range' })
  @ApiParam({ name: 'userId', description: 'User ID (UUID)', type: 'string' })
  @ApiQuery({ name: 'startDate', description: 'Start date (YYYY-MM-DD)', example: '2025-06-01' })
  @ApiQuery({ name: 'endDate', description: 'End date (YYYY-MM-DD)', example: '2025-06-30' })
  @ApiResponse({
    status: 200,
    description: 'Health logs within the specified date range',
    schema: {
      example: [
        {
          id: 'log-uuid-1',
          user_id: 'user-uuid',
          date: '2025-06-25',
          calories: 2000,
          steps: 8500,
          hydration_ml: 2500,
          sleep_hours: 7.5,
          vitamin_summary: 'Vitamin D3 1000IU',
          additional_metrics: { weight_kg: 70.5 },
          created_at: '2025-06-25T12:00:00.000Z'
        }
      ]
    }
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findByDateRange(
    @Param('userId') userId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return await this.healthLogsService.findByUserAndDateRange(userId, startDate, endDate);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get health log by ID' })
  @ApiParam({ name: 'id', description: 'Health log ID (UUID)', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Health log found',
    schema: {
      example: {
        id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        user_id: 'user-uuid-here',
        date: '2025-06-25',
        calories: 2000,
        steps: 8500,
        hydration_ml: 2500,
        sleep_hours: 7.5,
        vitamin_summary: 'Vitamin D3 1000IU, Omega-3',
        additional_metrics: { weight_kg: 70.5, mood: 'good' },
        user: {
          id: 'user-uuid-here',
          name: 'John Doe',
          email: 'john@example.com'
        },
        created_at: '2025-06-25T12:00:00.000Z'
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Health log not found' })
  @UsePipes(new ZodValidationPipe(getHealthLogByIdSchema))
  async findOne(@Param() params: { id: string }) {
    return await this.healthLogsService.findOne(params.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update health log by ID' })
  @ApiParam({ name: 'id', description: 'Health log ID (UUID)', type: 'string' })
  @ApiBody({ type: UpdateHealthLogDto })
  @ApiResponse({
    status: 200,
    description: 'Health log updated successfully',
    schema: {
      example: {
        id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        user_id: 'user-uuid-here',
        date: '2025-06-25',
        calories: 2100,
        steps: 9000,
        hydration_ml: 2800,
        sleep_hours: 8.0,
        vitamin_summary: 'Vitamin D3 1000IU, Omega-3, B-Complex',
        additional_metrics: { weight_kg: 70.2, mood: 'excellent' },
        created_at: '2025-06-25T12:00:00.000Z'
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Health log not found' })
  @ApiResponse({ status: 409, description: 'Date conflict with existing log' })
  @UsePipes(new ZodValidationPipe(getHealthLogByIdSchema))
  async update(
    @Param() params: { id: string },
    @Body(new ZodValidationPipe(updateHealthLogSchema)) updateHealthLogDto: UpdateHealthLogDto,
  ) {
    return await this.healthLogsService.update(params.id, updateHealthLogDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete health log by ID' })
  @ApiParam({ name: 'id', description: 'Health log ID (UUID)', type: 'string' })
  @ApiResponse({ status: 204, description: 'Health log deleted successfully' })
  @ApiResponse({ status: 404, description: 'Health log not found' })
  @UsePipes(new ZodValidationPipe(getHealthLogByIdSchema))
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param() params: { id: string }): Promise<void> {
    await this.healthLogsService.remove(params.id);
  }
}
