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
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, GetUserByIdDto } from './dto/user.dto';
import { ZodValidationPipe } from '../../shared/pipes/zod-validation.pipe';
import {
  createUserSchema,
  updateUserSchema,
  getUserByIdSchema,
} from './dto/user.zod';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createUserSchema))
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    // Remove sensitive data from response
    const { password_hash, ...userResponse } = user;
    return userResponse;
  }

  @Get()
  async findAll() {
    const users = await this.usersService.findAll();
    return users.map(user => {
      const { password_hash, ...userResponse } = user;
      return userResponse;
    });
  }

  @Get(':id')
  @UsePipes(new ZodValidationPipe(getUserByIdSchema))
  async findOne(@Param() params: GetUserByIdDto) {
    const user = await this.usersService.findOne(params.id);
    const { password_hash, ...userResponse } = user;
    return userResponse;
  }

  @Patch(':id')
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
  @UsePipes(new ZodValidationPipe(getUserByIdSchema))
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param() params: GetUserByIdDto): Promise<void> {
    await this.usersService.remove(params.id);
  }
}
