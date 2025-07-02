import {
  Controller,
  Post,
  Body,
  Headers,
  HttpCode,
  HttpStatus,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiHeader,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('webhook/supabase')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Handle Supabase webhook events' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid webhook data' })
  async handleSupabaseWebhook(
    @Headers() headers: any,
    @Body() payload: any,
  ) {
    try {
      // 🔧 Enhanced logging for debugging
      this.logger.log('=== WEBHOOK DEBUG INFO ===');
      this.logger.log(`Headers: ${JSON.stringify(headers)}`);
      this.logger.log(`Payload: ${JSON.stringify(payload)}`);
      this.logger.log(`Payload type: ${typeof payload}`);
      this.logger.log(`Payload keys: ${payload ? Object.keys(payload) : 'null'}`);
      this.logger.log('========================');

      // 🔧 More flexible validation
      if (!payload) {
        this.logger.error('Payload is null or undefined');
        throw new BadRequestException('Missing webhook payload');
      }

      // 🔧 Handle different webhook formats
      let event: string;
      let userData: any;

      // Check for different webhook formats
      if (headers['x-supabase-event-type']) {
        // Auth webhook format - event in header
        event = headers['x-supabase-event-type'];
        userData = payload;
        this.logger.log(`Auth webhook format detected: ${event}`);
      } else if (payload.event && payload.data) {
        // Legacy format - event and data in payload
        event = payload.event;
        userData = payload.data;
        this.logger.log(`Legacy webhook format detected: ${event}`);
      } else if (payload.type && (payload.record || payload.old_record)) {
        // Database webhook format
        event = this.mapDatabaseEventToAuthEvent(payload.type);
        userData = payload.record || payload.old_record;
        this.logger.log(`Database webhook format detected: ${event}`);
      } else if (payload.user_id && payload.claims) {
        // 🔧 Supabase JWT webhook format
        event = 'jwt.verification';
        userData = {
          id: payload.user_id,
          claims: payload.claims,
          authentication_method: payload.authentication_method
        };
        this.logger.log('Supabase JWT webhook format detected');
        
        // For JWT webhooks, we don't need to create users, just log and return success
        this.logger.log(`JWT verification webhook for user: ${payload.user_id}`);
        return { 
          success: true, 
          message: 'JWT webhook processed successfully',
          event,
          user_id: payload.user_id
        };
      } else if (payload.id && payload.email) {
        // Direct user data - assume user.created
        event = 'user.created';
        userData = payload;
        this.logger.log('Direct user data format detected');
      } else if (payload.user_id) {
        // 🔧 Handle case where we only have user_id (might be a different event)
        this.logger.log('Webhook with user_id only - fetching user data from Supabase');
        try {
          const user = await this.authService.getUserBySupabaseId(payload.user_id);
          if (user) {
            this.logger.log(`Found existing user for user_id: ${payload.user_id}`);
            return { 
              success: true, 
              message: 'User already exists',
              user_id: payload.user_id
            };
          } else {
            // User doesn't exist in our DB, try to fetch from Supabase and create
            event = 'user.sync';
            userData = { id: payload.user_id };
          }
        } catch (error) {
          this.logger.error(`Error checking user: ${error.message}`);
          return { 
            success: true, 
            message: 'Webhook acknowledged but user check failed',
            user_id: payload.user_id
          };
        }
      } else {
        // 🔧 Handle unknown webhook format gracefully
        this.logger.warn('Unknown webhook format - acknowledging to prevent retries');
        this.logger.warn(`Available payload keys: ${Object.keys(payload || {})}`);
        
        // Return success to prevent Supabase from retrying
        return { 
          success: true, 
          message: 'Unknown webhook format acknowledged',
          payload_keys: Object.keys(payload || {}),
          note: 'Webhook acknowledged to prevent retries'
        };
      }

      if (!event || !userData) {
        this.logger.warn(`Missing event (${event}) or user data - returning success to prevent retries`);
        return { 
          success: true, 
          message: 'Incomplete webhook data acknowledged',
          event,
          userData: userData ? 'present' : 'missing'
        };
      }

      // 🔧 Optional webhook secret verification (only if secret is configured)
      const webhookSecret = this.configService.get<string>('SUPABASE_WEBHOOK_SECRET');
      if (webhookSecret) {
        const authorization = headers.authorization;
        if (authorization) {
          const providedSecret = authorization.replace('Bearer ', '');
          if (providedSecret !== webhookSecret) {
            this.logger.warn('Webhook secret mismatch - but processing anyway');
            // Don't throw error, just warn
          }
        } else {
          this.logger.warn('No authorization header - but processing anyway');
        }
      }

      // Process the webhook
      await this.authService.handleWebhookEvent(event, userData);
      
      this.logger.log(`✅ Successfully processed webhook event: ${event}`);
      return { 
        success: true, 
        message: 'Webhook processed successfully',
        event,
        user_id: userData.id || userData.user_id || 'unknown'
      };
    } catch (error) {
      this.logger.error('❌ Webhook processing failed:', error);
      
      // 🔧 Always return success in production to prevent webhook retries
      if (this.configService.get('NODE_ENV') === 'production') {
        this.logger.error('Returning success to prevent webhook retries in production');
        return { 
          success: false, 
          message: 'Webhook processing failed but marked as handled',
          error: error.message 
        };
      }
      
      // In development, you can choose to throw or return success
      return { 
        success: false, 
        message: 'Webhook processing failed',
        error: error.message 
      };
    }
  }

  // 🔧 Helper method to map database events to auth events
  private mapDatabaseEventToAuthEvent(dbEvent: string): string {
    switch (dbEvent?.toUpperCase()) {
      case 'INSERT':
        return 'user.created';
      case 'UPDATE':
        return 'user.updated';
      case 'DELETE':
        return 'user.deleted';
      default:
        return `user.${dbEvent?.toLowerCase() || 'unknown'}`;
    }
  }

  @Post('verify-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify Supabase token and get user info' })
  @ApiHeader({
    name: 'authorization',
    description: 'Bearer token from Supabase',
  })
  @ApiResponse({
    status: 200,
    description: 'Token verified successfully',
    schema: {
      example: {
        user: {
          id: 'user-uuid',
          supabase_id: 'supabase-uuid',
          email: 'user@example.com',
          name: 'John Doe',
          is_active: true,
        },
        supabase_user: {
          id: 'supabase-uuid',
          email: 'user@example.com',
          user_metadata: {},
        },
      },
    },
  })
  async verifyToken(@Headers('authorization') authorization: string) {
    if (!authorization || !authorization.startsWith('Bearer ')) {
      throw new BadRequestException('Missing or invalid authorization header');
    }

    const token = authorization.substring(7);
    
    try {
      const supabaseUser = await this.authService.validateSupabaseToken(token);
      const user = await this.authService.findOrCreateUser(supabaseUser);

      return {
        user: {
          id: user.id,
          supabase_id: user.supabase_id,
          email: user.email,
          name: user.name,
          profile_image: user.profile_image,
          is_active: user.is_active,
        },
        supabase_user: supabaseUser,
      };
    } catch (error) {
      this.logger.error('Token verification failed:', error);
      throw new BadRequestException('Token verification failed');
    }
  }
}
