import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, OneToMany, CreateDateColumn, UpdateDateColumn, JoinColumn, JoinTable } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum ChallengeType {
  STEPS = 'steps',
  CALORIES = 'calories',
  HYDRATION = 'hydration',
  SLEEP = 'sleep',
  EXERCISE = 'exercise',
  MEDITATION = 'meditation',
  CUSTOM = 'custom'
}

export enum ChallengeStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum ChallengeDifficulty {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert'
}

@Entity('challenges')
export class Challenge {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'enum', enum: ChallengeType })
  type: ChallengeType;

  @Column({ type: 'enum', enum: ChallengeDifficulty, default: ChallengeDifficulty.BEGINNER })
  difficulty: ChallengeDifficulty;

  @Column({ type: 'json' })
  goal: Record<string, any>; // target value, unit, etc.

  @Column({ type: 'int' })
  duration_days: number;

  @Column({ type: 'date' })
  start_date: Date;

  @Column({ type: 'date' })
  end_date: Date;

  @Column({ type: 'enum', enum: ChallengeStatus, default: ChallengeStatus.DRAFT })
  status: ChallengeStatus;

  @Column({ type: 'boolean', default: false })
  is_public: boolean;

  @Column({ type: 'int', default: 0 })
  max_participants: number;

  @Column({ type: 'json', nullable: true })
  rewards: Record<string, any>; // points, badges, etc.

  @Column({ type: 'json', nullable: true })
  rules: Record<string, any>; // challenge-specific rules

  @Column({ type: 'text', nullable: true })
  image_url: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'creator_id' })
  creator: User;

  @Column({ type: 'uuid' })
  creator_id: string;

  @ManyToMany(() => User, (user) => user.challenges)
  @JoinTable({
    name: 'challenge_participants',
    joinColumn: { name: 'challenge_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' }
  })
  participants: User[];

  @OneToMany(() => ChallengeProgress, (progress) => progress.challenge)
  progress: ChallengeProgress[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

@Entity('challenge_progress')
export class ChallengeProgress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Challenge, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'challenge_id' })
  challenge: Challenge;

  @Column({ type: 'uuid' })
  challenge_id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'json' })
  progress_data: Record<string, any>; // actual values for the day

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  completion_percentage: number;

  @Column({ type: 'boolean', default: false })
  is_completed: boolean;

  @Column({ type: 'json', nullable: true })
  notes: Record<string, any>; // user notes, achievements, etc.

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
