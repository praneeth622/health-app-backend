import { z } from 'zod';

export const createRoleSchema = z.object({
  name: z
    .string()
    .min(1, 'Role name is required')
    .max(50, 'Role name must be less than 50 characters'),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  permissions: z
    .record(z.any())
    .optional(),
  is_active: z
    .boolean()
    .optional(),
});

export const updateRoleSchema = z.object({
  name: z
    .string()
    .min(1, 'Role name is required')
    .max(50, 'Role name must be less than 50 characters')
    .optional(),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  permissions: z
    .record(z.any())
    .optional(),
  is_active: z
    .boolean()
    .optional(),
});

export const getRoleByIdSchema = z.object({
  id: z.string().uuid('Invalid role ID format'),
});

export type CreateRoleDto = z.infer<typeof createRoleSchema>;
export type UpdateRoleDto = z.infer<typeof updateRoleSchema>;
export type GetRoleByIdDto = z.infer<typeof getRoleByIdSchema>;