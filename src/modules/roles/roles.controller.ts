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
import { RolesService } from './roles.service';
import { CreateRoleDto, UpdateRoleDto, RoleResponseDto } from './dto/role.dto';
import { ZodValidationPipe } from '../../shared/pipes/zod-validation.pipe';
import {
  createRoleSchema,
  updateRoleSchema,
  getRoleByIdSchema,
} from './dto/role.zod';

@ApiTags('roles')
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new role' })
  @ApiBody({ type: CreateRoleDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Role created successfully', 
    type: RoleResponseDto,
    schema: {
      example: {
        id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        name: 'admin',
        description: 'Administrator role with full access',
        permissions: { read: true, write: true, delete: true },
        is_active: true,
        created_at: '2025-06-25T12:00:00.000Z',
        updated_at: '2025-06-25T12:00:00.000Z'
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 409, description: 'Role already exists' })
  @UsePipes(new ZodValidationPipe(createRoleSchema))
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createRoleDto: CreateRoleDto): Promise<RoleResponseDto> {
    return await this.rolesService.create(createRoleDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all roles' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of all roles', 
    type: [RoleResponseDto],
    schema: {
      example: [
        {
          id: 'role-uuid-1',
          name: 'admin',
          description: 'Administrator role',
          permissions: { read: true, write: true, delete: true },
          is_active: true,
          created_at: '2025-06-25T12:00:00.000Z',
          updated_at: '2025-06-25T12:00:00.000Z'
        },
        {
          id: 'role-uuid-2',
          name: 'user',
          description: 'Regular user role',
          permissions: { read: true, write: false, delete: false },
          is_active: true,
          created_at: '2025-06-25T12:00:00.000Z',
          updated_at: '2025-06-25T12:00:00.000Z'
        }
      ]
    }
  })
  async findAll(): Promise<RoleResponseDto[]> {
    return await this.rolesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get role by ID' })
  @ApiParam({ name: 'id', description: 'Role ID (UUID)', type: 'string' })
  @ApiResponse({ 
    status: 200, 
    description: 'Role found', 
    type: RoleResponseDto,
    schema: {
      example: {
        id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        name: 'admin',
        description: 'Administrator role with full access',
        permissions: { read: true, write: true, delete: true },
        is_active: true,
        created_at: '2025-06-25T12:00:00.000Z',
        updated_at: '2025-06-25T12:00:00.000Z'
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Role not found' })
  @UsePipes(new ZodValidationPipe(getRoleByIdSchema))
  async findOne(@Param() params: { id: string }): Promise<RoleResponseDto> {
    return await this.rolesService.findOne(params.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update role by ID' })
  @ApiParam({ name: 'id', description: 'Role ID (UUID)', type: 'string' })
  @ApiBody({ type: UpdateRoleDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Role updated successfully', 
    type: RoleResponseDto,
    schema: {
      example: {
        id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        name: 'moderator',
        description: 'Updated moderator role',
        permissions: { read: true, write: true, delete: false },
        is_active: true,
        created_at: '2025-06-25T12:00:00.000Z',
        updated_at: '2025-06-25T13:00:00.000Z'
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Role not found' })
  @ApiResponse({ status: 409, description: 'Role name already exists' })
  @UsePipes(new ZodValidationPipe(getRoleByIdSchema))
  async update(
    @Param() params: { id: string },
    @Body(new ZodValidationPipe(updateRoleSchema)) updateRoleDto: UpdateRoleDto,
  ): Promise<RoleResponseDto> {
    return await this.rolesService.update(params.id, updateRoleDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete role by ID' })
  @ApiParam({ name: 'id', description: 'Role ID (UUID)', type: 'string' })
  @ApiResponse({ status: 204, description: 'Role deleted successfully' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  @UsePipes(new ZodValidationPipe(getRoleByIdSchema))
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param() params: { id: string }): Promise<void> {
    await this.rolesService.remove(params.id);
  }
}
