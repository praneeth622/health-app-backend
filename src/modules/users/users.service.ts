import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Check if user with same email already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException(`User with email '${createUserDto.email}' already exists`);
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(createUserDto.password, saltRounds);

    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    return await this.userRepository.save(user);
  }

  async findAll(page: number = 1, limit: number = 20): Promise<{ users: User[]; total: number; page: number; limit: number; total_pages: number }> {
    const skip = (page - 1) * limit;

    const [users, total] = await this.userRepository.findAndCount({
      select: {
        id: true,
        name: true,
        email: true,
        date_of_birth: true,
        gender: true,
        height: true,
        weight: true,
        activity_level: true,
        health_goals: true,
        medical_conditions: true,
        profile_image: true,
        bio: true,
        is_active: true,
        created_at: true,
        updated_at: true,
      },
      order: { created_at: 'DESC' },
      take: limit,
      skip,
    });

    return {
      users,
      total,
      page,
      limit,
      total_pages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['health_logs', 'challenges', 'user_roles', 'user_roles.role'],
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        date_of_birth: true,
        gender: true,
        height: true,
        weight: true,
        activity_level: true,
        health_goals: true,
        medical_conditions: true,
        profile_image: true,
        bio: true,
        is_active: true,
        created_at: true,
        updated_at: true,
        health_logs: {
          id: true,
          date: true,
          created_at: true,
        },
        challenges: {
          id: true,
          title: true,
          type: true,
          status: true,
          start_date: true,
          end_date: true,
        },
        user_roles: {
          id: true,
          is_active: true,
          role: {
            id: true,
            name: true,
            description: true,
            permissions: true,
          }
        }
      }
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { email },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    // Check if updating email and it conflicts with existing user
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: updateUserDto.email },
      });

      if (existingUser) {
        throw new ConflictException(`User with email '${updateUserDto.email}' already exists`);
      }
    }

    Object.assign(user, updateUserDto);
    return await this.userRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
  }
}
