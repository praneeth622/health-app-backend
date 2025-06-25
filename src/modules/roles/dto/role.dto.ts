import {CreateRoleDto as CreateRoleSchema, UpdateRoleDto as UpdateRoleSchema, GetRoleByIdDto as GetRoleByIdSchema} from './role.zod';

export class CreateRoleDto implements CreateRoleSchema {
  name: string;
}

export class UpdateRoleDto implements UpdateRoleSchema {
  name?: string;
}

export class GetRoleByIdDto implements GetRoleByIdSchema {
  id: number;
}

export class RoleResponseDto {
  id: number;
  name: string;
}