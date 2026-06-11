import { z } from 'zod';
import { AppError } from '../../middlewares/error.middleware.js';
import {
  findAllPaymentMethods,
  findPaymentMethodById,
  createPaymentMethod,
  updatePaymentMethod,
  softDeletePaymentMethod,
} from './payment_method.model.js';
import type { PaymentMethodRecord } from './payment_method.model.js';

// --- Schemas Zod ---

// Schema para crear un método de pago
export const create_payment_method_schema = z.object({
  method: z.string().min(1, { message: 'El tipo de método es requerido' }),
  bank: z.string().min(1, { message: 'El banco es requerido' }),
  account_number: z.string().min(1, { message: 'El número de cuenta es requerido' }),
  account_holder: z.string().min(1, { message: 'El titular de la cuenta es requerido' }),
});

// Schema para actualizar un método de pago (todos opcionales)
export const update_payment_method_schema = z.object({
  method: z.string().min(1).optional(),
  bank: z.string().min(1).optional(),
  account_number: z.string().min(1).optional(),
  account_holder: z.string().min(1).optional(),
});

// Tipos inferidos de los schemas
export type CreatePaymentMethodInput = z.infer<typeof create_payment_method_schema>;
export type UpdatePaymentMethodInput = z.infer<typeof update_payment_method_schema>;

// --- Servicios ---

// Retorna todos los métodos de pago activos
export const getAllPaymentMethodsService = async (): Promise<PaymentMethodRecord[]> => {
  return findAllPaymentMethods();
};

// Retorna un método de pago por id, lanza 404 si no existe
export const getPaymentMethodByIdService = async (id: string): Promise<PaymentMethodRecord> => {
  const record = await findPaymentMethodById(id);
  if (!record) throw new AppError('Método de pago no encontrado', 404);
  return record;
};

// Crea un nuevo método de pago
export const createPaymentMethodService = async (
  input: CreatePaymentMethodInput
): Promise<PaymentMethodRecord> => {
  return createPaymentMethod(input);
};

// Actualiza los campos enviados de un método de pago existente
export const updatePaymentMethodService = async (
  id: string,
  input: UpdatePaymentMethodInput
): Promise<PaymentMethodRecord> => {
  // Verifica que el método de pago existe antes de actualizar
  await getPaymentMethodByIdService(id);

  const updated = await updatePaymentMethod(id, input);
  return updated!;
};

// Realiza el soft delete de un método de pago (is_active = false)
export const deletePaymentMethodService = async (id: string): Promise<void> => {
  await getPaymentMethodByIdService(id);
  await softDeletePaymentMethod(id);
};
