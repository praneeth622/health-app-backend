import { CreateUserDto as CreateUserSchema, UpdateUserDto as UpdateUserSchema, GetUserByIdDto as GetUserByIdSchema } from './user.zod';

export class CreateUserDto implements CreateUserSchema {
  email: string;
  name?: string;
  bio?: string;
  profile_image?: string;
  cover_image?: string;
  fitness_goal?: string;
  interests?: string[];
  role_id?: number;
}

export class UpdateUserDto implements UpdateUserSchema {
  name?: string;
  bio?: string;
  profile_image?: string;
  cover_image?: string;
  fitness_goal?: string;
  interests?: string[];
  role_id?: number;
}

export class GetUserByIdDto implements GetUserByIdSchema {
  id: string;
}