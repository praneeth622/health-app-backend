import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum ReminderType {
  MEDICATION = 'medication',
  EXERCISE = 'exercise',
  MEAL = 'meal',
  WATER = 'water',
  SLEEP = 'sleep',
  APPOINTMENT = 'appointment',
  CUSTOM = 'custom'
}

export enum ReminderFrequency {
  ONCE = 'once',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  CUSTOM = 'custom'
}

export enum ReminderStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

@Entity('reminders')
export class Reminder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: ReminderType })
  type: ReminderType;

  @Column({ type: 'enum', enum: ReminderFrequency })
  frequency: ReminderFrequency;

  @Column({ type: 'time' })
  time: string;

  @Column({ type: 'date', nullable: true })
  start_date: Date;

  @Column({ type: 'date', nullable: true })
  end_date: Date;

  @Column({ type: 'json', nullable: true })
  custom_schedule: Record<string, any>; // For custom frequency patterns

  @Column({ type: 'enum', enum: ReminderStatus, default: ReminderStatus.ACTIVE })
  status: ReminderStatus;

  @Column({ type: 'boolean', default: true })
  is_notification_enabled: boolean;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>; // medication details, exercise info, etc.

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
