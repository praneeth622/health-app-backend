import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThan } from 'typeorm';
import { Challenge, ChallengeProgress, ChallengeStatus } from './entities/challenge.entity';
import { CreateChallengeDto } from './dto/create-challenge.dto';
import { UpdateChallengeDto, JoinChallengeDto, UpdateProgressDto } from './dto/update-challenge.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class ChallengesService {
  constructor(
    @InjectRepository(Challenge)
    private readonly challengeRepository: Repository<Challenge>,
    @InjectRepository(ChallengeProgress)
    private readonly progressRepository: Repository<ChallengeProgress>,
    private readonly usersService: UsersService,
  ) {}

  async create(createChallengeDto: CreateChallengeDto): Promise<Challenge> {
    // Validate creator exists
    await this.usersService.findOne(createChallengeDto.creator_id);

    // Calculate end_date based on start_date and duration
    const startDate = new Date(createChallengeDto.start_date);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + createChallengeDto.duration_days - 1);

    // Validate start date is not in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (startDate < today) {
      throw new BadRequestException('Start date cannot be in the past');
    }

    const challenge = this.challengeRepository.create({
      ...createChallengeDto,
      end_date: endDate,
    });

    return await this.challengeRepository.save(challenge);
  }

  async findPublicChallenges(
    page: number = 1,
    limit: number = 20,
    type?: string,
    difficulty?: string,
    status?: ChallengeStatus,
  ): Promise<{ challenges: Challenge[]; total: number; page: number; limit: number; total_pages: number }> {
    const skip = (page - 1) * limit;
    const whereCondition: any = { is_public: true };

    if (type) whereCondition.type = type;
    if (difficulty) whereCondition.difficulty = difficulty;
    if (status) whereCondition.status = status;

    const [challenges, total] = await this.challengeRepository.findAndCount({
      where: whereCondition,
      relations: ['creator', 'participants'],
      select: {
        creator: {
          id: true,
          name: true,
          email: true,
        },
        participants: {
          id: true,
          name: true,
        }
      },
      order: { created_at: 'DESC' },
      take: limit,
      skip,
    });

    return {
      challenges,
      total,
      page,
      limit,
      total_pages: Math.ceil(total / limit),
    };
  }

  async findByCreator(
    creatorId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ challenges: Challenge[]; total: number; page: number; limit: number; total_pages: number }> {
    // Validate creator exists
    await this.usersService.findOne(creatorId);

    const skip = (page - 1) * limit;

    const [challenges, total] = await this.challengeRepository.findAndCount({
      where: { creator_id: creatorId },
      relations: ['creator', 'participants'],
      select: {
        creator: {
          id: true,
          name: true,
          email: true,
        },
        participants: {
          id: true,
          name: true,
        }
      },
      order: { created_at: 'DESC' },
      take: limit,
      skip,
    });

    return {
      challenges,
      total,
      page,
      limit,
      total_pages: Math.ceil(total / limit),
    };
  }

  async findUserChallenges(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ challenges: Challenge[]; total: number; page: number; limit: number; total_pages: number }> {
    // Validate user exists
    await this.usersService.findOne(userId);

    const skip = (page - 1) * limit;

    const [challenges, total] = await this.challengeRepository
      .createQueryBuilder('challenge')
      .leftJoinAndSelect('challenge.creator', 'creator')
      .leftJoinAndSelect('challenge.participants', 'participants')
      .where('participants.id = :userId', { userId })
      .select([
        'challenge',
        'creator.id', 'creator.name', 'creator.email',
        'participants.id', 'participants.name'
      ])
      .orderBy('challenge.created_at', 'DESC')
      .take(limit)
      .skip(skip)
      .getManyAndCount();

    return {
      challenges,
      total,
      page,
      limit,
      total_pages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Challenge> {
    const challenge = await this.challengeRepository.findOne({
      where: { id },
      relations: ['creator', 'participants', 'progress', 'progress.user'],
      select: {
        creator: {
          id: true,
          name: true,
          email: true,
        },
        participants: {
          id: true,
          name: true,
          email: true,
        },
        progress: {
          id: true,
          date: true,
          progress_data: true,
          completion_percentage: true,
          is_completed: true,
          notes: true,
          user: {
            id: true,
            name: true,
          }
        }
      }
    });

    if (!challenge) {
      throw new NotFoundException(`Challenge with ID ${id} not found`);
    }

    return challenge;
  }

  async update(id: string, updateChallengeDto: UpdateChallengeDto): Promise<Challenge> {
    const challenge = await this.findOne(id);

    // Don't allow updates to active challenges with participants
    if (challenge.status === ChallengeStatus.ACTIVE && challenge.participants.length > 0) {
      throw new ConflictException('Cannot update active challenge with participants');
    }

    // Recalculate end_date if start_date or duration changes
    if (updateChallengeDto.start_date || updateChallengeDto.duration_days) {
      const startDate = new Date(updateChallengeDto.start_date || challenge.start_date);
      const duration = updateChallengeDto.duration_days || challenge.duration_days;
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + duration - 1);
      
      Object.assign(challenge, updateChallengeDto, { end_date: endDate });
    } else {
      Object.assign(challenge, updateChallengeDto);
    }

    return await this.challengeRepository.save(challenge);
  }

  async joinChallenge(joinChallengeDto: JoinChallengeDto): Promise<Challenge> {
    const { challengeId, userId } = joinChallengeDto;

    // Validate user exists
    await this.usersService.findOne(userId);

    const challenge = await this.challengeRepository.findOne({
      where: { id: challengeId },
      relations: ['participants'],
    });

    if (!challenge) {
      throw new NotFoundException(`Challenge with ID ${challengeId} not found`);
    }

    // Check if challenge is joinable
    if (challenge.status !== ChallengeStatus.ACTIVE && challenge.status !== ChallengeStatus.DRAFT) {
      throw new ConflictException('Challenge is not available for joining');
    }

    // Check if already a participant
    const isAlreadyParticipant = challenge.participants.some(p => p.id === userId);
    if (isAlreadyParticipant) {
      throw new ConflictException('User is already a participant in this challenge');
    }

    // Check max participants limit
    if (challenge.max_participants > 0 && challenge.participants.length >= challenge.max_participants) {
      throw new ConflictException('Challenge has reached maximum participants');
    }

    // Add user to participants
    const user = await this.usersService.findOne(userId);
    challenge.participants.push(user);

    return await this.challengeRepository.save(challenge);
  }

  async leaveChallenge(challengeId: string, userId: string): Promise<void> {
    const challenge = await this.challengeRepository.findOne({
      where: { id: challengeId },
      relations: ['participants'],
    });

    if (!challenge) {
      throw new NotFoundException(`Challenge with ID ${challengeId} not found`);
    }

    // Remove user from participants
    challenge.participants = challenge.participants.filter(p => p.id !== userId);
    await this.challengeRepository.save(challenge);

    // Remove user's progress entries
    await this.progressRepository.delete({ challenge_id: challengeId, user_id: userId });
  }

  async updateProgress(updateProgressDto: UpdateProgressDto): Promise<ChallengeProgress> {
    const { challengeId, userId, date, progress_data, notes } = updateProgressDto;

    // Validate challenge and user exist
    const challenge = await this.findOne(challengeId);
    await this.usersService.findOne(userId);

    // Check if user is a participant
    const isParticipant = challenge.participants.some(p => p.id === userId);
    if (!isParticipant) {
      throw new ConflictException('User is not a participant in this challenge');
    }

    // Check if date is within challenge period
    const progressDate = new Date(date);
    if (progressDate < challenge.start_date || progressDate > challenge.end_date) {
      throw new BadRequestException('Progress date is outside challenge period');
    }

    // Find or create progress entry
    let progress = await this.progressRepository.findOne({
      where: { challenge_id: challengeId, user_id: userId, date: progressDate },
    });

    if (!progress) {
      progress = this.progressRepository.create({
        challenge_id: challengeId,
        user_id: userId,
        date: progressDate,
        progress_data,
        notes,
      });
    } else {
      Object.assign(progress, { progress_data, notes });
    }

    // Calculate completion percentage based on challenge goal
    const completionPercentage = this.calculateCompletionPercentage(challenge, progress_data);
    progress.completion_percentage = completionPercentage;
    progress.is_completed = completionPercentage >= 100;

    return await this.progressRepository.save(progress);
  }

  async getUserProgress(
    challengeId: string,
    userId: string,
  ): Promise<{ progress: ChallengeProgress[]; summary: any }> {
    // Validate challenge and user exist
    const challenge = await this.findOne(challengeId);
    await this.usersService.findOne(userId);

    const progress = await this.progressRepository.find({
      where: { challenge_id: challengeId, user_id: userId },
      relations: ['user'],
      select: {
        user: {
          id: true,
          name: true,
        }
      },
      order: { date: 'ASC' },
    });

    // Calculate summary statistics
    const summary = {
      total_days: progress.length,
      completed_days: progress.filter(p => p.is_completed).length,
      average_completion: progress.length > 0 
        ? progress.reduce((sum, p) => sum + p.completion_percentage, 0) / progress.length 
        : 0,
      current_streak: this.calculateStreak(progress),
      best_day: progress.length > 0 
        ? progress.reduce((best: ChallengeProgress | null, current: ChallengeProgress) => {
            if (!best) return current;
            return current.completion_percentage > best.completion_percentage ? current : best;
          }, null)
        : null,
    };

    return { progress, summary };
  }

  async getChallengeLeaderboard(challengeId: string): Promise<any[]> {
    const challenge = await this.findOne(challengeId);

    const leaderboard = await this.progressRepository
      .createQueryBuilder('progress')
      .leftJoinAndSelect('progress.user', 'user')
      .select([
        'user.id',
        'user.name',
        'AVG(progress.completion_percentage) as avg_completion',
        'COUNT(progress.id) as total_entries',
        'SUM(CASE WHEN progress.is_completed = true THEN 1 ELSE 0 END) as completed_days'
      ])
      .where('progress.challenge_id = :challengeId', { challengeId })
      .groupBy('user.id, user.name')
      .orderBy('avg_completion', 'DESC')
      .addOrderBy('completed_days', 'DESC')
      .getRawMany();

    return leaderboard.map((entry, index) => ({
      rank: index + 1,
      user: {
        id: entry.user_id,
        name: entry.user_name,
      },
      avg_completion: parseFloat(entry.avg_completion || 0),
      total_entries: parseInt(entry.total_entries || 0),
      completed_days: parseInt(entry.completed_days || 0),
    }));
  }

  async remove(id: string): Promise<void> {
    const challenge = await this.findOne(id);

    // Don't allow deletion of active challenges with participants
    if (challenge.status === ChallengeStatus.ACTIVE && challenge.participants.length > 0) {
      throw new ConflictException('Cannot delete active challenge with participants');
    }

    await this.challengeRepository.remove(challenge);
  }

  private calculateCompletionPercentage(challenge: Challenge, progressData: Record<string, any>): number {
    const goal = challenge.goal;
    
    // This is a simplified calculation - you can make it more sophisticated based on challenge type
    if (goal.target && progressData[Object.keys(progressData)[0]]) {
      const achieved = progressData[Object.keys(progressData)[0]];
      return Math.min(100, (achieved / goal.target) * 100);
    }
    
    return 0;
  }

  private calculateStreak(progress: ChallengeProgress[]): number {
    if (progress.length === 0) return 0;

    let currentStreak = 0;
    const sortedProgress = progress.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    for (const entry of sortedProgress) {
      if (entry.is_completed) {
        currentStreak++;
      } else {
        break;
      }
    }

    return currentStreak;
  }
}
