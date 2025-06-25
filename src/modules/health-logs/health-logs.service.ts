import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { HealthLog } from './entities/health-log.entity';
import { CreateHealthLogDto, UpdateHealthLogDto } from './dto/health-log.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class HealthLogsService {
  constructor(
    @InjectRepository(HealthLog)
    private readonly healthLogRepository: Repository<HealthLog>,
    private readonly usersService: UsersService,
  ) {}

  async create(createHealthLogDto: CreateHealthLogDto): Promise<HealthLog> {
    // Validate user exists
    await this.usersService.findOne(createHealthLogDto.user_id);

    // Check if log already exists for this user and date
    const existingLog = await this.healthLogRepository.findOne({
      where: {
        user_id: createHealthLogDto.user_id,
        date: createHealthLogDto.date,
      },
    });

    if (existingLog) {
      throw new ConflictException('Health log already exists for this date. Use update instead.');
    }

    const healthLog = this.healthLogRepository.create(createHealthLogDto);
    return await this.healthLogRepository.save(healthLog);
  }

  async findByUser(
    userId: string, 
    page: number = 1, 
    limit: number = 20
  ): Promise<{ health_logs: HealthLog[]; total: number; page: number; limit: number; total_pages: number }> {
    // Validate user exists
    await this.usersService.findOne(userId);

    const skip = (page - 1) * limit;
    
    const [healthLogs, total] = await this.healthLogRepository.findAndCount({
      where: { user_id: userId },
      relations: ['user'],
      select: {
        user: {
          id: true,
          name: true,
          email: true,
        }
      },
      order: { date: 'DESC' },
      take: limit,
      skip,
    });

    return {
      health_logs: healthLogs,
      total,
      page,
      limit,
      total_pages: Math.ceil(total / limit),
    };
  }

  async findByUserAndDateRange(
    userId: string,
    startDate: string,
    endDate: string,
  ): Promise<HealthLog[]> {
    // Validate user exists
    await this.usersService.findOne(userId);

    const start = new Date(startDate);
    const end = new Date(endDate);

    return await this.healthLogRepository.find({
      where: {
        user_id: userId,
        date: Between(start, end),
      },
      relations: ['user'],
      select: {
        user: {
          id: true,
          name: true,
          email: true,
        }
      },
      order: { date: 'ASC' },
    });
  }

  async findOne(id: string): Promise<HealthLog> {
    const healthLog = await this.healthLogRepository.findOne({
      where: { id },
      relations: ['user'],
      select: {
        user: {
          id: true,
          name: true,
          email: true,
        }
      }
    });

    if (!healthLog) {
      throw new NotFoundException(`Health log with ID ${id} not found`);
    }

    return healthLog;
  }

  async update(id: string, updateHealthLogDto: UpdateHealthLogDto): Promise<HealthLog> {
    const healthLog = await this.findOne(id);

    // If updating date, check for conflicts
    if (updateHealthLogDto.date) {
      const existingLog = await this.healthLogRepository.findOne({
        where: {
          user_id: healthLog.user_id,
          date: updateHealthLogDto.date,
        },
      });

      if (existingLog && existingLog.id !== id) {
        throw new ConflictException('Health log already exists for this date');
      }
    }

    Object.assign(healthLog, updateHealthLogDto);
    return await this.healthLogRepository.save(healthLog);
  }

  async remove(id: string): Promise<void> {
    const healthLog = await this.findOne(id);
    await this.healthLogRepository.remove(healthLog);
  }

  async getStats(
    userId: string,
    startDate: string,
    endDate: string,
  ): Promise<{
    avg_calories: number;
    avg_steps: number;
    avg_hydration_ml: number;
    avg_sleep_hours: number;
    total_entries: number;
    date_range: { start_date: string; end_date: string };
  }> {
    const healthLogs = await this.findByUserAndDateRange(userId, startDate, endDate);

    if (healthLogs.length === 0) {
      return {
        avg_calories: 0,
        avg_steps: 0,
        avg_hydration_ml: 0,
        avg_sleep_hours: 0,
        total_entries: 0,
        date_range: { start_date: startDate, end_date: endDate },
      };
    }

    const totals = healthLogs.reduce(
      (acc, log) => ({
        calories: acc.calories + (log.calories || 0),
        steps: acc.steps + (log.steps || 0),
        hydration_ml: acc.hydration_ml + (log.hydration_ml || 0),
        sleep_hours: acc.sleep_hours + (log.sleep_hours || 0),
      }),
      { calories: 0, steps: 0, hydration_ml: 0, sleep_hours: 0 }
    );

    const count = healthLogs.length;

    return {
      avg_calories: Math.round((totals.calories / count) * 100) / 100,
      avg_steps: Math.round((totals.steps / count) * 100) / 100,
      avg_hydration_ml: Math.round((totals.hydration_ml / count) * 100) / 100,
      avg_sleep_hours: Math.round((totals.sleep_hours / count) * 100) / 100,
      total_entries: count,
      date_range: { start_date: startDate, end_date: endDate },
    };
  }
}
