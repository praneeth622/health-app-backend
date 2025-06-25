import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Reminder, ReminderStatus } from './entities/reminder.entity';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { UpdateReminderDto, UpdateReminderStatusDto } from './dto/update-reminder.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class RemindersService {
  constructor(
    @InjectRepository(Reminder)
    private readonly reminderRepository: Repository<Reminder>,
    private readonly usersService: UsersService,
  ) {}

  async create(createReminderDto: CreateReminderDto): Promise<Reminder> {
    // Validate user exists
    await this.usersService.findOne(createReminderDto.user_id);

    // Validate dates if provided
    if (createReminderDto.start_date && createReminderDto.end_date) {
      if (createReminderDto.start_date >= createReminderDto.end_date) {
        throw new ConflictException('End date must be after start date');
      }
    }

    const reminder = this.reminderRepository.create(createReminderDto);
    return await this.reminderRepository.save(reminder);
  }

  async findByUser(
    userId: string, 
    page: number = 1, 
    limit: number = 20,
    status?: ReminderStatus,
    type?: string,
  ): Promise<{ reminders: Reminder[]; total: number; page: number; limit: number; total_pages: number }> {
    // Validate user exists
    await this.usersService.findOne(userId);

    const skip = (page - 1) * limit;
    const whereCondition: any = { user_id: userId };
    
    if (status) {
      whereCondition.status = status;
    }
    
    if (type) {
      whereCondition.type = type;
    }
    
    const [reminders, total] = await this.reminderRepository.findAndCount({
      where: whereCondition,
      relations: ['user'],
      select: {
        user: {
          id: true,
          name: true,
          email: true,
        }
      },
      order: { created_at: 'DESC' },
      take: limit,
      skip,
    });

    return {
      reminders,
      total,
      page,
      limit,
      total_pages: Math.ceil(total / limit),
    };
  }

  async findActiveRemindersForTime(time: string): Promise<Reminder[]> {
    return await this.reminderRepository.find({
      where: {
        time,
        status: ReminderStatus.ACTIVE,
        is_notification_enabled: true,
      },
      relations: ['user'],
      select: {
        user: {
          id: true,
          name: true,
          email: true,
        }
      }
    });
  }

  async findUpcomingReminders(userId: string, hours: number = 24): Promise<Reminder[]> {
    // Validate user exists
    await this.usersService.findOne(userId);

    const now = new Date();
    const future = new Date(now.getTime() + (hours * 60 * 60 * 1000));

    return await this.reminderRepository.find({
      where: {
        user_id: userId,
        status: ReminderStatus.ACTIVE,
        is_notification_enabled: true,
      },
      relations: ['user'],
      select: {
        user: {
          id: true,
          name: true,
          email: true,
        }
      },
      order: { time: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Reminder> {
    const reminder = await this.reminderRepository.findOne({
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

    if (!reminder) {
      throw new NotFoundException(`Reminder with ID ${id} not found`);
    }

    return reminder;
  }

  async update(id: string, updateReminderDto: UpdateReminderDto): Promise<Reminder> {
    const reminder = await this.findOne(id);

    // Validate dates if provided
    const startDate = updateReminderDto.start_date || reminder.start_date;
    const endDate = updateReminderDto.end_date || reminder.end_date;
    
    if (startDate && endDate && startDate >= endDate) {
      throw new ConflictException('End date must be after start date');
    }

    Object.assign(reminder, updateReminderDto);
    return await this.reminderRepository.save(reminder);
  }

  async updateStatus(id: string, updateStatusDto: UpdateReminderStatusDto): Promise<Reminder> {
    const reminder = await this.findOne(id);
    reminder.status = updateStatusDto.status;
    return await this.reminderRepository.save(reminder);
  }

  async remove(id: string): Promise<void> {
    const reminder = await this.findOne(id);
    await this.reminderRepository.remove(reminder);
  }

  async getStats(userId: string): Promise<{
    total_reminders: number;
    active_reminders: number;
    completed_reminders: number;
    by_type: Record<string, number>;
    by_frequency: Record<string, number>;
  }> {
    // Validate user exists
    await this.usersService.findOne(userId);

    const reminders = await this.reminderRepository.find({
      where: { user_id: userId },
    });

    const stats = {
      total_reminders: reminders.length,
      active_reminders: reminders.filter(r => r.status === ReminderStatus.ACTIVE).length,
      completed_reminders: reminders.filter(r => r.status === ReminderStatus.COMPLETED).length,
      by_type: {} as Record<string, number>,
      by_frequency: {} as Record<string, number>,
    };

    // Count by type
    reminders.forEach(reminder => {
      stats.by_type[reminder.type] = (stats.by_type[reminder.type] || 0) + 1;
      stats.by_frequency[reminder.frequency] = (stats.by_frequency[reminder.frequency] || 0) + 1;
    });

    return stats;
  }

  async snoozeReminder(id: string, minutes: number): Promise<Reminder> {
    const reminder = await this.findOne(id);
    
    // Add snooze logic here - you might want to create a separate entity for snoozed reminders
    // For now, we'll just update metadata
    const snoozeUntil = new Date(Date.now() + (minutes * 60 * 1000));
    
    reminder.metadata = {
      ...reminder.metadata,
      snoozed_until: snoozeUntil.toISOString(),
      snooze_count: (reminder.metadata?.snooze_count || 0) + 1,
    };

    return await this.reminderRepository.save(reminder);
  }
}