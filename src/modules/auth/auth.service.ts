import { z } from 'zod';
import { AppError } from '../../middlewares/error.middleware.js';
import {
  findAllAuth,
  findAuthById,
  findAuthByEmail,
  findAuthByPhone,
  createAuth,
  updateAuth,
  deleteAuth,
} from './auth.model.js';
import type { AuthRecord } from './auth.model.js';

// --- Schemas Zod ---

// Schema para crear un registro auth
export const create_auth_schema = z.object({
  email: z.string().email({ message: 'Email inválido' }).optional(),
  phone: z.string().min(7, { message: 'Teléfono muy corto' }).optional(),
  password: z.string().min(6, { message: 'La contraseña debe tener al menos 6 caracteres' }),
  role: z.enum(['admin', 'customer']).optional().default('customer'),
});

// Schema para actualizar un registro auth
export const update_auth_schema = z.object({
  email: z.string().email({ message: 'Email inválido' }).optional(),
  phone: z.string().min(7, { message: 'Teléfono muy corto' }).optional(),
  password: z.string().min(6, { message: 'La contraseña debe tener al menos 6 caracteres' }).optional(),
});

// Tipos inferidos de los schemas
export type CreateAuthInput = z.infer<typeof create_auth_schema>;
export type UpdateAuthInput = z.infer<typeof update_auth_schema>;

// --- Servicios ---

// Retorna todos los registros auth
export const getAllAuthService = async (): Promise<AuthRecord[]> => {
  return findAllAuth();
};

// Retorna un registro auth por id, lanza 404 si no existe
export const getAuthByIdService = async (id: string): Promise<AuthRecord> => {
  const record = await findAuthById(id);
  if (!record) throw new AppError('Registro de autenticación no encontrado', 404);
  return record;
};

// Crea un nuevo registro auth verificando unicidad de email y teléfono
export const createAuthService = async (input: CreateAuthInput): Promise<AuthRecord> => {
  // Valida unicidad del email si se proporciona
  if (input.email) {
    const existing = await findAuthByEmail(input.email);
    if (existing) throw new AppError('El email ya está registrado', 409);
  }

  // Valida unicidad del teléfono si se proporciona
  if (input.phone) {
    const existing = await findAuthByPhone(input.phone);
    if (existing) throw new AppError('El teléfono ya está registrado', 409);
  }

  // Al menos email o teléfono deben estar presentes
  if (!input.email && !input.phone) {
    throw new AppError('Se requiere al menos un email o un teléfono', 400);
  }

  return createAuth(input);
};

// Actualiza un registro auth — re-hashea password si se incluye
export const updateAuthService = async (
  id: string,
  input: UpdateAuthInput
): Promise<AuthRecord> => {
  // Verifica que el registro existe
  await getAuthByIdService(id);

  // Valida unicidad del email si se está cambiando
  if (input.email) {
    const existing = await findAuthByEmail(input.email);
    if (existing && existing.id !== id) throw new AppError('El email ya está registrado', 409);
  }

  // Valida unicidad del teléfono si se está cambiando
  if (input.phone) {
    const existing = await findAuthByPhone(input.phone);
    if (existing && existing.id !== id) throw new AppError('El teléfono ya está registrado', 409);
  }

  const updated = await updateAuth(id, input);
  return updated!;
};

// Elimina permanentemente un registro auth (cascada a customer)
export const deleteAuthService = async (id: string): Promise<void> => {
  await getAuthByIdService(id);
  await deleteAuth(id);
};
