import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from '../modules/users/entities/user.entity';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private supabase: SupabaseClient;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    // 🔧 Make configuration more flexible
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const serviceRoleKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl) {
      this.logger.error('SUPABASE_URL is required');
      throw new Error('Missing SUPABASE_URL configuration');
    }

    if (!serviceRoleKey || serviceRoleKey.includes('your-service-role-key-here')) {
      this.logger.warn('SUPABASE_SERVICE_ROLE_KEY not properly configured - some features may not work');
      // Don't throw error, create client with anon key as fallback
      const anonKey = this.configService.get<string>('SUPABASE_ANON_KEY');
      this.supabase = createClient(supabaseUrl, anonKey || '');
    } else {
      this.supabase = createClient(supabaseUrl, serviceRoleKey);
    }
  }

  /**
   * Validate Supabase JWT token
   */
  async validateSupabaseToken(token: string): Promise<any> {
    try {
      const { data, error } = await this.supabase.auth.getUser(token);
      
      if (error || !data.user) {
        this.logger.warn('Token validation failed:', error?.message);
        throw new BadRequestException('Invalid token');
      }

      return data.user;
    } catch (error) {
      this.logger.error('Token validation failed:', error);
      throw new BadRequestException('Token validation failed');
    }
  }

  /**
   * Find or create user from Supabase user data
   */
  async findOrCreateUser(supabaseUser: any): Promise<User> {
    try {
      // First, try to find user by supabase_id
      let user = await this.userRepository.findOne({
        where: { supabase_id: supabaseUser.id },
      });

      if (user) {
        return user;
      }

      // If not found by supabase_id, try by email
      user = await this.userRepository.findOne({
        where: { email: supabaseUser.email },
      });

      if (user) {
        // Link existing user with Supabase
        user.supabase_id = supabaseUser.id;
        user.auth_source = 'supabase';
        await this.userRepository.save(user);
        this.logger.log(`Linked existing user with Supabase: ${user.id}`);
        return user;
      }

      // Create new user
      return this.createUserFromSupabase(supabaseUser);
    } catch (error) {
      this.logger.error('Error finding or creating user:', error);
      throw error;
    }
  }

  /**
   * Create user from Supabase webhook data
   */
  async createUserFromSupabase(supabaseUser: any): Promise<User> {
    try {
      const user = this.userRepository.create({
        supabase_id: supabaseUser.id,
        email: supabaseUser.email,
        name: supabaseUser.user_metadata?.full_name || 
              supabaseUser.user_metadata?.name || 
              supabaseUser.email.split('@')[0],
        auth_source: 'supabase',
        is_active: true,
        // Set other fields from metadata if available
        profile_image: supabaseUser.user_metadata?.avatar_url,
      });

      const savedUser = await this.userRepository.save(user);
      this.logger.log(`Created user from Supabase: ${savedUser.id}`);
      
      return savedUser;
    } catch (error) {
      this.logger.error('Failed to create user from Supabase:', error);
      throw error;
    }
  }

  /**
   * Handle Supabase webhook events
   */
  async handleWebhookEvent(event: string, data: any): Promise<void> {
    this.logger.log(`Received webhook event: ${event}`);

    try {
      switch (event) {
        case 'user.created':
          await this.createUserFromSupabase(data);
          break;
        
        case 'user.updated':
          await this.updateUserFromSupabase(data);
          break;
        
        case 'user.deleted':
          await this.deactivateUser(data.id);
          break;
        
        default:
          this.logger.warn(`Unhandled webhook event: ${event}`);
      }
    } catch (error) {
      this.logger.error(`Failed to handle webhook event ${event}:`, error);
      throw error;
    }
  }

  /**
   * Update user from Supabase data
   */
  private async updateUserFromSupabase(supabaseUser: any): Promise<void> {
    try {
      const user = await this.userRepository.findOne({
        where: { supabase_id: supabaseUser.id },
      });

      if (user) {
        user.email = supabaseUser.email;
        user.name = supabaseUser.user_metadata?.full_name || 
                    supabaseUser.user_metadata?.name || 
                    user.name;
        user.profile_image = supabaseUser.user_metadata?.avatar_url || user.profile_image;
        
        await this.userRepository.save(user);
        this.logger.log(`Updated user from Supabase: ${user.id}`);
      } else {
        this.logger.warn(`User not found for Supabase ID: ${supabaseUser.id}`);
      }
    } catch (error) {
      this.logger.error('Failed to update user from Supabase:', error);
      throw error;
    }
  }

  /**
   * Deactivate user (soft delete)
   */
  private async deactivateUser(supabaseId: string): Promise<void> {
    try {
      const result = await this.userRepository.update(
        { supabase_id: supabaseId },
        { is_active: false }
      );

      // 🔧 Fix: Check if result.affected exists
      if (result.affected && result.affected > 0) {
        this.logger.log(`Deactivated user: ${supabaseId}`);
      } else {
        this.logger.warn(`User not found for deactivation: ${supabaseId}`);
      }
    } catch (error) {
      this.logger.error('Failed to deactivate user:', error);
      throw error;
    }
  }

  /**
   * Get user by Supabase ID
   */
  async getUserBySupabaseId(supabaseId: string): Promise<User | null> {
    try {
      return await this.userRepository.findOne({
        where: { supabase_id: supabaseId, is_active: true },
        relations: ['health_logs', 'challenges', 'user_roles'],
      });
    } catch (error) {
      this.logger.error('Failed to get user by Supabase ID:', error);
      return null;
    }
  }
}
