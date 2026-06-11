import { z } from 'zod';
import { AppError } from '../../middlewares/error.middleware.js';
import {
  findAllCustomers,
  findCustomerById,
  findCustomerByAuthId,
  createCustomer,
  updateCustomer,
  softDeleteCustomer,
} from './customer.model.js';
import type { CustomerRecord } from './customer.model.js';

// --- Schemas Zod ---

// Schema para crear un cliente
export const create_customer_schema = z.object({
  auth_id: z.string().uuid({ message: 'auth_id debe ser un UUID válido' }),
  first_name: z.string().min(1, { message: 'El nombre es requerido' }),
  last_name: z.string().min(1, { message: 'El apellido es requerido' }),
  country: z.string().min(1).optional().default('México'),
  street_address: z.string().min(1, { message: 'La calle es requerida' }),
  interior_number: z.string().optional(),
  exterior_number: z.string().min(1, { message: 'El número exterior es requerido' }),
  postal_code: z.string().min(4, { message: 'El código postal es inválido' }),
  city: z.string().min(1, { message: 'La ciudad es requerida' }),
  state: z.string().min(1, { message: 'El estado es requerido' }),
  phone: z.string().min(7, { message: 'El teléfono es inválido' }),
});

// Schema para actualizar un cliente (todos los campos opcionales)
export const update_customer_schema = z.object({
  first_name: z.string().min(1).optional(),
  last_name: z.string().min(1).optional(),
  country: z.string().min(1).optional(),
  street_address: z.string().min(1).optional(),
  interior_number: z.string().optional(),
  exterior_number: z.string().min(1).optional(),
  postal_code: z.string().min(4).optional(),
  city: z.string().min(1).optional(),
  state: z.string().min(1).optional(),
  phone: z.string().min(7).optional(),
});

// Tipos inferidos de los schemas
export type CreateCustomerInput = z.infer<typeof create_customer_schema>;
export type UpdateCustomerInput = z.infer<typeof update_customer_schema>;

// --- Servicios ---

// Retorna todos los clientes activos
export const getAllCustomersService = async (): Promise<CustomerRecord[]> => {
  return findAllCustomers();
};

// Retorna un cliente por id, lanza 404 si no existe
export const getCustomerByIdService = async (id: string): Promise<CustomerRecord> => {
  const customer = await findCustomerById(id);
  if (!customer) throw new AppError('Cliente no encontrado', 404);
  return customer;
};

// Crea un nuevo cliente verificando que auth_id no esté duplicado
export const createCustomerService = async (
  input: CreateCustomerInput
): Promise<CustomerRecord> => {
  // Verifica que no exista ya un perfil para ese auth_id
  const existing = await findCustomerByAuthId(input.auth_id);
  if (existing) throw new AppError('Ya existe un perfil de cliente para este usuario', 409);

  return createCustomer(input);
};

// Actualiza los campos enviados de un cliente existente
export const updateCustomerService = async (
  id: string,
  input: UpdateCustomerInput
): Promise<CustomerRecord> => {
  // Verifica que el cliente existe antes de actualizar
  await getCustomerByIdService(id);

  const updated = await updateCustomer(id, input);
  return updated!;
};

// Realiza el soft delete de un cliente (is_active = false)
export const deleteCustomerService = async (id: string): Promise<void> => {
  await getCustomerByIdService(id);
  await softDeleteCustomer(id);
};
