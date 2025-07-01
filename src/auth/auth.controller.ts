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
  ApiBody,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post('webhook/supabase')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Handle Supabase webhook events' })
  @ApiHeader({
    name: 'authorization',
    description: 'Webhook signature verification',
  })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid webhook data' })
  async handleSupabaseWebhook(
    @Headers('authorization') authorization: string,
    @Body() payload: any,
  ) {
    try {
      // Verify webhook signature (you'll implement this based on Supabase docs)
      // For now, basic validation
      if (!authorization || !payload) {
        throw new BadRequestException('Invalid webhook request');
      }

      const { event, data } = payload;
      
      if (!event || !data) {
        throw new BadRequestException('Missing event or data in webhook payload');
      }

      await this.authService.handleWebhookEvent(event, data);
      
      this.logger.log(`Successfully processed webhook event: ${event}`);
      return { success: true, message: 'Webhook processed successfully' };
    } catch (error) {
      this.logger.error('Webhook processing failed:', error);
      throw error;
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
