import { CreateRoleDto as ZodCreateRoleDto, UpdateRoleDto as ZodUpdateRoleDto, GetRoleByIdDto as ZodGetRoleByIdDto } from './role.dto';

export class CreateRoleDto implements ZodCreateRoleDto {
  name: string;
}

export class UpdateRoleDto implements ZodUpdateRoleDto {
  name?: string;
}

export class GetRoleByIdDto implements ZodGetRoleByIdDto {
  id: number;
}

export class RoleResponseDto {
  id: number;
  name: string;
}
