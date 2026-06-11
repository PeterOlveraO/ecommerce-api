import { Request, Response } from 'express';
import { successResponse } from '../../utils/response.js';
import { registerService, getMeService } from './customer.register.service.js';
import type { RegisterInput } from './customer.register.service.js';
import { findCustomerByAuthId } from './customer.model.js';
import { updateCustomer } from './customer.model.js';
import { AppError } from '../../middlewares/error.middleware.js';
import type { UpdateCustomerPayload } from './customer.model.js';

// POST /register — Crea cuenta auth + perfil customer de forma atómica
export const register = async (req: Request, res: Response): Promise<void> => {
  const input  = req.body as RegisterInput;
  const result = await registerService(input);
  successResponse(res, result, 'Cuenta creada exitosamente', 201);
};

// GET /me — Devuelve el perfil del cliente autenticado
export const getMe = async (req: Request, res: Response): Promise<void> => {
  const auth_id = req.user!.id;
  const profile = await getMeService(auth_id);
  successResponse(res, profile, 'Perfil obtenido correctamente');
};

// PUT /me — Actualiza los datos del propio perfil
export const updateMe = async (req: Request, res: Response): Promise<void> => {
  const auth_id = req.user!.id;

  // Obtiene el customer vinculado al usuario autenticado
  const customer = await findCustomerByAuthId(auth_id);
  if (!customer) throw new AppError('Perfil de cliente no encontrado', 404);

  const payload = req.body as UpdateCustomerPayload;
  const updated = await updateCustomer(customer.id, payload);
  successResponse(res, updated, 'Perfil actualizado correctamente');
};
