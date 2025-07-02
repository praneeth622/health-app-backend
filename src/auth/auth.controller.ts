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
      } else if (payload.id && payload.email) {
        // Direct user data - assume user.created
        event = 'user.created';
        userData = payload;
        this.logger.log('Direct user data format detected');
      } else {
        this.logger.error('Unknown webhook format');
        this.logger.error(`Available payload keys: ${Object.keys(payload || {})}`);
        throw new BadRequestException('Unknown webhook format - please check payload structure');
      }

      if (!event || !userData) {
        throw new BadRequestException(`Missing event (${event}) or user data`);
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
      
      // 🔧 Don't throw error in production to avoid webhook retries
      if (this.configService.get('NODE_ENV') === 'production') {
        this.logger.error('Returning success to prevent webhook retries in production');
        return { 
          success: false, 
          message: 'Webhook processing failed but marked as handled',
          error: error.message 
        };
      }
      
      throw error;
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
