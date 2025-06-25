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
import { ChallengesService } from './challenges.service';
import { CreateChallengeDto } from './dto/create-challenge.dto';
import { UpdateChallengeDto, JoinChallengeDto, UpdateProgressDto } from './dto/update-challenge.dto';
import { ChallengeType, ChallengeDifficulty, ChallengeStatus } from './entities/challenge.entity';
import { ZodValidationPipe } from '../../shared/pipes/zod-validation.pipe';
import {
  createChallengeSchema,
  updateChallengeSchema,
  getChallengeByIdSchema,
  joinChallengeSchema,
  updateProgressSchema,
} from './dto/challenge.zod';

@ApiTags('challenges')
@Controller('challenges')
export class ChallengesController {
  constructor(private readonly challengesService: ChallengesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new challenge' })
  @ApiBody({ type: CreateChallengeDto })
  @ApiResponse({
    status: 201,
    description: 'Challenge created successfully',
    schema: {
      example: {
        id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        title: '10,000 Steps Daily Challenge',
        description: 'Walk 10,000 steps every day for 30 days',
        type: 'steps',
        difficulty: 'beginner',
        goal: {
          target: 10000,
          unit: 'steps',
          daily_target: 10000
        },
        duration_days: 30,
        start_date: '2025-07-01',
        end_date: '2025-07-30',
        status: 'draft',
        is_public: true,
        max_participants: 100,
        rewards: {
          points: 500,
          badges: ['Step Master']
        },
        creator_id: 'creator-uuid-here',
        created_at: '2025-06-25T12:00:00.000Z'
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @UsePipes(new ZodValidationPipe(createChallengeSchema))
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createChallengeDto: CreateChallengeDto) {
    return await this.challengesService.create(createChallengeDto);
  }

  @Get('public')
  @ApiOperation({ summary: 'Get all public challenges' })
  @ApiQuery({ name: 'page', description: 'Page number', required: false, example: 1 })
  @ApiQuery({ name: 'limit', description: 'Items per page', required: false, example: 20 })
  @ApiQuery({ 
    name: 'type', 
    description: 'Filter by challenge type', 
    required: false, 
    enum: ChallengeType 
  })
  @ApiQuery({ 
    name: 'difficulty', 
    description: 'Filter by difficulty level', 
    required: false, 
    enum: ChallengeDifficulty 
  })
  @ApiQuery({ 
    name: 'status', 
    description: 'Filter by challenge status', 
    required: false, 
    enum: ChallengeStatus 
  })
  @ApiResponse({
    status: 200,
    description: 'List of public challenges',
    schema: {
      example: {
        challenges: [
          {
            id: 'challenge-uuid-1',
            title: '10,000 Steps Daily Challenge',
            description: 'Walk 10,000 steps every day',
            type: 'steps',
            difficulty: 'beginner',
            duration_days: 30,
            start_date: '2025-07-01',
            end_date: '2025-07-30',
            status: 'active',
            participants: [
              { id: 'user-1', name: 'John Doe' },
              { id: 'user-2', name: 'Jane Smith' }
            ],
            creator: {
              id: 'creator-uuid',
              name: 'Health Coach',
              email: 'coach@example.com'
            }
          }
        ],
        total: 50,
        page: 1,
        limit: 20,
        total_pages: 3
      }
    }
  })
  async findPublicChallenges(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Query('type') type?: ChallengeType,
    @Query('difficulty') difficulty?: ChallengeDifficulty,
    @Query('status') status?: ChallengeStatus,
  ) {
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    return await this.challengesService.findPublicChallenges(pageNum, limitNum, type, difficulty, status);
  }

  @Get('creator/:creatorId')
  @ApiOperation({ summary: 'Get challenges created by a specific user' })
  @ApiParam({ name: 'creatorId', description: 'Creator User ID (UUID)', type: 'string' })
  @ApiQuery({ name: 'page', description: 'Page number', required: false, example: 1 })
  @ApiQuery({ name: 'limit', description: 'Items per page', required: false, example: 20 })
  @ApiResponse({
    status: 200,
    description: 'List of challenges created by the user',
    schema: {
      example: {
        challenges: [
          {
            id: 'challenge-uuid-1',
            title: 'My Personal Step Challenge',
            description: 'Custom challenge for my fitness goals',
            type: 'steps',
            difficulty: 'intermediate',
            status: 'active',
            participants: [],
            creator: {
              id: 'creator-uuid',
              name: 'John Doe',
              email: 'john@example.com'
            }
          }
        ],
        total: 5,
        page: 1,
        limit: 20,
        total_pages: 1
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Creator not found' })
  async findByCreator(
    @Param('creatorId') creatorId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    return await this.challengesService.findByCreator(creatorId, pageNum, limitNum);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get challenges that a user is participating in' })
  @ApiParam({ name: 'userId', description: 'User ID (UUID)', type: 'string' })
  @ApiQuery({ name: 'page', description: 'Page number', required: false, example: 1 })
  @ApiQuery({ name: 'limit', description: 'Items per page', required: false, example: 20 })
  @ApiResponse({
    status: 200,
    description: 'List of challenges the user is participating in',
    schema: {
      example: {
        challenges: [
          {
            id: 'challenge-uuid-1',
            title: 'Community Step Challenge',
            description: 'Join our community challenge',
            type: 'steps',
            difficulty: 'beginner',
            status: 'active',
            participants: [
              { id: 'user-1', name: 'John Doe' },
              { id: 'user-2', name: 'Jane Smith' }
            ],
            creator: {
              id: 'creator-uuid',
              name: 'Health Coach',
              email: 'coach@example.com'
            }
          }
        ],
        total: 3,
        page: 1,
        limit: 20,
        total_pages: 1
      }
    }
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findUserChallenges(
    @Param('userId') userId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    return await this.challengesService.findUserChallenges(userId, pageNum, limitNum);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get challenge by ID' })
  @ApiParam({ name: 'id', description: 'Challenge ID (UUID)', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Challenge details with participants and progress',
    schema: {
      example: {
        id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        title: '10,000 Steps Daily Challenge',
        description: 'Walk 10,000 steps every day for 30 days',
        type: 'steps',
        difficulty: 'beginner',
        goal: {
          target: 10000,
          unit: 'steps',
          daily_target: 10000
        },
        duration_days: 30,
        start_date: '2025-07-01',
        end_date: '2025-07-30',
        status: 'active',
        is_public: true,
        max_participants: 100,
        rewards: {
          points: 500,
          badges: ['Step Master']
        },
        creator: {
          id: 'creator-uuid',
          name: 'Health Coach',
          email: 'coach@example.com'
        },
        participants: [
          { id: 'user-1', name: 'John Doe', email: 'john@example.com' },
          { id: 'user-2', name: 'Jane Smith', email: 'jane@example.com' }
        ],
        progress: [
          {
            id: 'progress-uuid-1',
            date: '2025-07-01',
            progress_data: { steps: 12000 },
            completion_percentage: 120,
            is_completed: true,
            user: { id: 'user-1', name: 'John Doe' }
          }
        ]
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Challenge not found' })
  @UsePipes(new ZodValidationPipe(getChallengeByIdSchema))
  async findOne(@Param() params: { id: string }) {
    return await this.challengesService.findOne(params.id);
  }

  @Post(':id/join')
  @ApiOperation({ summary: 'Join a challenge' })
  @ApiParam({ name: 'id', description: 'Challenge ID (UUID)', type: 'string' })
  @ApiBody({ type: JoinChallengeDto })
  @ApiResponse({
    status: 200,
    description: 'Successfully joined the challenge',
    schema: {
      example: {
        id: 'challenge-uuid',
        title: '10,000 Steps Daily Challenge',
        participants: [
          { id: 'existing-user', name: 'Jane Doe' },
          { id: 'new-user', name: 'John Smith' }
        ]
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Challenge not found' })
  @ApiResponse({ status: 409, description: 'Cannot join challenge (already participant, max capacity, etc.)' })
  @UsePipes(new ZodValidationPipe(joinChallengeSchema))
  async joinChallenge(@Body() joinChallengeDto: JoinChallengeDto) {
    return await this.challengesService.joinChallenge(joinChallengeDto);
  }

  @Delete(':id/leave/:userId')
  @ApiOperation({ summary: 'Leave a challenge' })
  @ApiParam({ name: 'id', description: 'Challenge ID (UUID)', type: 'string' })
  @ApiParam({ name: 'userId', description: 'User ID (UUID)', type: 'string' })
  @ApiResponse({ status: 204, description: 'Successfully left the challenge' })
  @ApiResponse({ status: 404, description: 'Challenge not found' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async leaveChallenge(
    @Param('id') challengeId: string,
    @Param('userId') userId: string,
  ): Promise<void> {
    await this.challengesService.leaveChallenge(challengeId, userId);
  }

  @Post('progress')
  @ApiOperation({ summary: 'Update progress for a challenge' })
  @ApiBody({ type: UpdateProgressDto })
  @ApiResponse({
    status: 201,
    description: 'Progress updated successfully',
    schema: {
      example: {
        id: 'progress-uuid',
        challenge_id: 'challenge-uuid',
        user_id: 'user-uuid',
        date: '2025-07-01',
        progress_data: {
          steps: 12500,
          distance_km: 8.2,
          calories_burned: 420
        },
        completion_percentage: 125,
        is_completed: true,
        notes: {
          mood: 'energetic',
          weather: 'sunny'
        },
        created_at: '2025-07-01T20:00:00.000Z'
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid progress data or date outside challenge period' })
  @ApiResponse({ status: 409, description: 'User is not a participant in this challenge' })
  @UsePipes(new ZodValidationPipe(updateProgressSchema))
  @HttpCode(HttpStatus.CREATED)
  async updateProgress(@Body() updateProgressDto: UpdateProgressDto) {
    return await this.challengesService.updateProgress(updateProgressDto);
  }

  @Get(':id/progress/:userId')
  @ApiOperation({ summary: 'Get user progress for a specific challenge' })
  @ApiParam({ name: 'id', description: 'Challenge ID (UUID)', type: 'string' })
  @ApiParam({ name: 'userId', description: 'User ID (UUID)', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'User progress and summary statistics',
    schema: {
      example: {
        progress: [
          {
            id: 'progress-uuid-1',
            date: '2025-07-01',
            progress_data: { steps: 12000 },
            completion_percentage: 120,
            is_completed: true,
            notes: { mood: 'great' },
            user: { id: 'user-uuid', name: 'John Doe' }
          }
        ],
        summary: {
          total_days: 15,
          completed_days: 12,
          average_completion: 95.5,
          current_streak: 5,
          best_day: {
            date: '2025-07-10',
            completion_percentage: 150
          }
        }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Challenge or user not found' })
  async getUserProgress(
    @Param('id') challengeId: string,
    @Param('userId') userId: string,
  ) {
    return await this.challengesService.getUserProgress(challengeId, userId);
  }

  @Get(':id/leaderboard')
  @ApiOperation({ summary: 'Get challenge leaderboard' })
  @ApiParam({ name: 'id', description: 'Challenge ID (UUID)', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Challenge leaderboard with participant rankings',
    schema: {
      example: [
        {
          rank: 1,
          user: {
            id: 'user-uuid-1',
            name: 'John Doe'
          },
          avg_completion: 98.5,
          total_entries: 25,
          completed_days: 24
        },
        {
          rank: 2,
          user: {
            id: 'user-uuid-2',
            name: 'Jane Smith'
          },
          avg_completion: 92.3,
          total_entries: 23,
          completed_days: 21
        }
      ]
    }
  })
  @ApiResponse({ status: 404, description: 'Challenge not found' })
  async getChallengeLeaderboard(@Param('id') challengeId: string) {
    return await this.challengesService.getChallengeLeaderboard(challengeId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update challenge by ID' })
  @ApiParam({ name: 'id', description: 'Challenge ID (UUID)', type: 'string' })
  @ApiBody({ type: UpdateChallengeDto })
  @ApiResponse({
    status: 200,
    description: 'Challenge updated successfully',
    schema: {
      example: {
        id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        title: '12,000 Steps Daily Challenge',
        description: 'Updated challenge with higher target',
        type: 'steps',
        difficulty: 'intermediate',
        goal: {
          target: 12000,
          unit: 'steps',
          daily_target: 12000
        },
        duration_days: 45,
        status: 'active',
        updated_at: '2025-06-25T13:00:00.000Z'
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Challenge not found' })
  @ApiResponse({ status: 409, description: 'Cannot update active challenge with participants' })
  @UsePipes(new ZodValidationPipe(getChallengeByIdSchema))
  async update(
    @Param() params: { id: string },
    @Body(new ZodValidationPipe(updateChallengeSchema)) updateChallengeDto: UpdateChallengeDto,
  ) {
    return await this.challengesService.update(params.id, updateChallengeDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete challenge by ID' })
  @ApiParam({ name: 'id', description: 'Challenge ID (UUID)', type: 'string' })
  @ApiResponse({ status: 204, description: 'Challenge deleted successfully' })
  @ApiResponse({ status: 404, description: 'Challenge not found' })
  @ApiResponse({ status: 409, description: 'Cannot delete active challenge with participants' })
  @UsePipes(new ZodValidationPipe(getChallengeByIdSchema))
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param() params: { id: string }): Promise<void> {
    await this.challengesService.remove(params.id);
  }
}
