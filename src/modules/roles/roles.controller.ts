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
import { RolesService } from './roles.service';
import { CreateRoleDto, UpdateRoleDto, RoleResponseDto } from './dto/role.dto';
import { ZodValidationPipe } from '../../shared/pipes/zod-validation.pipe';
import {
  createRoleSchema,
  updateRoleSchema,
  getRoleByIdSchema,
} from './dto/role.zod';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createRoleSchema))
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createRoleDto: CreateRoleDto): Promise<RoleResponseDto> {
    const role = await this.rolesService.create(createRoleDto);
    return {
      id: role.id,
      name: role.name,
    };
  }

  @Get()
  async findAll(): Promise<RoleResponseDto[]> {
    const roles = await this.rolesService.findAll();
    return roles.map(role => ({
      id: role.id,
      name: role.name,
    }));
  }

  @Get(':id')
  @UsePipes(new ZodValidationPipe(getRoleByIdSchema))
  async findOne(@Param() params: { id: number }): Promise<RoleResponseDto> {
    const role = await this.rolesService.findOne(params.id);
    return {
      id: role.id,
      name: role.name,
    };
  }

  @Patch(':id')
  @UsePipes(new ZodValidationPipe(getRoleByIdSchema))
  async update(
    @Param() params: { id: number },
    @Body(new ZodValidationPipe(updateRoleSchema)) updateRoleDto: UpdateRoleDto,
  ): Promise<RoleResponseDto> {
    const role = await this.rolesService.update(params.id, updateRoleDto);
    return {
      id: role.id,
      name: role.name,
    };
  }

  @Delete(':id')
  @UsePipes(new ZodValidationPipe(getRoleByIdSchema))
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param() params: { id: number }): Promise<void> {
    await this.rolesService.remove(params.id);
  }
}
