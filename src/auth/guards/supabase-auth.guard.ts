import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  private readonly logger = new Logger(SupabaseAuthGuard.name);

  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Extract user information from the request
    const request = context.switchToHttp().getRequest();
    const authorization = request.headers.authorization;

    if (!authorization || !authorization.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid authorization header');
    }

    const token = authorization.substring(7);

    try {
      // Validate Supabase token
      const supabaseUser = await this.authService.validateSupabaseToken(token);
      
      // Find or create user in your database
      const user = await this.authService.findOrCreateUser(supabaseUser);

      if (!user.is_active) {
        throw new UnauthorizedException('User account is deactivated');
      }

      // Attach user to request for use in controllers
      request.user = user;
      request.supabaseUser = supabaseUser;

      return true;
    } catch (error) {
      this.logger.error('Authentication failed:', error);
      throw new UnauthorizedException('Authentication failed');
    }
  }
}