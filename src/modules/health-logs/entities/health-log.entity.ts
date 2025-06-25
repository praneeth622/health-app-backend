import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('health_logs')
export class HealthLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'int', nullable: true })
  calories: number;

  @Column({ type: 'int', nullable: true })
  steps: number;

  @Column({ type: 'int', nullable: true })
  hydration_ml: number;

  @Column({ type: 'decimal', precision: 3, scale: 1, nullable: true })
  sleep_hours: number;

  @Column({ type: 'text', nullable: true })
  vitamin_summary: string;

  @Column({ type: 'json', nullable: true })
  additional_metrics: Record<string, any>;

  @CreateDateColumn()
  created_at: Date;
}
