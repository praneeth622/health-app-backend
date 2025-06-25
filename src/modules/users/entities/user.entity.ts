import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Role } from '../../roles/entities/role.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  password_hash: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ type: 'text', nullable: true })
  profile_image: string;

  @Column({ type: 'text', nullable: true })
  cover_image: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  fitness_goal: string;

  @Column({ type: 'text', array: true, nullable: true })
  interests: string[];

  @ManyToOne(() => Role, (role) => role.users, { nullable: true })
  role: Role;

  @Column({ type: 'int', nullable: true })
  role_id: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
