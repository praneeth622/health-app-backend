import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { UserRole } from '../../user-roles/entities/user-role.entity';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'json', nullable: true })
  permissions: Record<string, any>;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @OneToMany(() => UserRole, (userRole) => userRole.role)
  user_roles: UserRole[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
