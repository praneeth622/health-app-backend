import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { HealthLog } from '../../health-logs/entities/health-log.entity';
import { Challenge } from '../../challenges/entities/challenge.entity';
import { UserRole } from '../../user-roles/entities/user-role.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // 🔧 Add Supabase ID field
  @Column({ type: 'uuid', unique: true, nullable: true })
  supabase_id?: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 150, unique: true })
  email: string;

  // 🔧 Make password optional (since Supabase handles it)
  @Column({ type: 'varchar', length: 255, nullable: true })
  password?: string;

  @Column({ type: 'date', nullable: true })
  date_of_birth: Date;

  @Column({ type: 'enum', enum: ['male', 'female', 'other'], nullable: true })
  gender: 'male' | 'female' | 'other';

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  height: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  weight: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  activity_level: string;

  @Column({ type: 'json', nullable: true })
  health_goals: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  medical_conditions: Record<string, any>;

  @Column({ type: 'varchar', length: 255, nullable: true })
  profile_image: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  // 🔧 Add auth source tracking
  @Column({ type: 'enum', enum: ['local', 'supabase'], default: 'supabase' })
  auth_source: 'local' | 'supabase';

  @OneToMany(() => HealthLog, (healthLog) => healthLog.user)
  health_logs: HealthLog[];

  @ManyToMany(() => Challenge, (challenge) => challenge.participants)
  challenges: Challenge[];

  @OneToMany(() => UserRole, (userRole) => userRole.user)
  user_roles: UserRole[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
