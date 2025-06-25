import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UsePipes,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, GetUserByIdDto } from './dto/user.dto';
import { ZodValidationPipe } from '../../shared/pipes/zod-validation.pipe';
import {
  createUserSchema,
  updateUserSchema,
  getUserByIdSchema,
} from './dto/user.zod';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  @UsePipes(new ZodValidationPipe(createUserSchema))
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    // Remove sensitive data from response
    const { password_hash, ...userResponse } = user;
    return userResponse;
  }

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'List of all users' })
  async findAll() {
    const users = await this.usersService.findAll();
    return users.map(user => {
      const { password_hash, ...userResponse } = user;
      return userResponse;
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User ID (UUID)', type: 'string' })
  @ApiResponse({ status: 200, description: 'User found' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @UsePipes(new ZodValidationPipe(getUserByIdSchema))
  async findOne(@Param() params: GetUserByIdDto) {
    const user = await this.usersService.findOne(params.id);
    const { password_hash, ...userResponse } = user;
    return userResponse;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user by ID' })
  @ApiParam({ name: 'id', description: 'User ID (UUID)', type: 'string' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @UsePipes(new ZodValidationPipe(getUserByIdSchema))
  async update(
    @Param() params: GetUserByIdDto,
    @Body(new ZodValidationPipe(updateUserSchema)) updateUserDto: UpdateUserDto,
  ) {
    const user = await this.usersService.update(params.id, updateUserDto);
    const { password_hash, ...userResponse } = user;
    return userResponse;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user by ID' })
  @ApiParam({ name: 'id', description: 'User ID (UUID)', type: 'string' })
  @ApiResponse({ status: 204, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @UsePipes(new ZodValidationPipe(getUserByIdSchema))
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param() params: GetUserByIdDto): Promise<void> {
    await this.usersService.remove(params.id);
  }
}
