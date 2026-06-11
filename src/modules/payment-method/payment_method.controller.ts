import { Request, Response } from 'express';
import { successResponse } from '../../utils/response.js';
import {
  getAllPaymentMethodsService,
  getPaymentMethodByIdService,
  createPaymentMethodService,
  updatePaymentMethodService,
  deletePaymentMethodService,
} from './payment_method.service.js';
import type { CreatePaymentMethodInput, UpdatePaymentMethodInput } from './payment_method.service.js';

// GET /payment-methods — Lista todos los métodos de pago activos
export const getAll = async (_req: Request, res: Response): Promise<void> => {
  const methods = await getAllPaymentMethodsService();
  successResponse(res, methods);
};

// GET /payment-methods/:id — Obtiene un método de pago por id
export const getOne = async (req: Request, res: Response): Promise<void> => {
  const method = await getPaymentMethodByIdService(req.params.id as string);
  successResponse(res, method);
};

// POST /payment-methods — Crea un nuevo método de pago
export const create = async (req: Request, res: Response): Promise<void> => {
  const input = req.body as CreatePaymentMethodInput;
  const method = await createPaymentMethodService(input);
  successResponse(res, method, 'Método de pago creado', 201);
};

// PUT /payment-methods/:id — Actualiza un método de pago existente
export const update = async (req: Request, res: Response): Promise<void> => {
  const input = req.body as UpdatePaymentMethodInput;
  const method = await updatePaymentMethodService(req.params.id as string, input);
  successResponse(res, method, 'Método de pago actualizado');
};

// DELETE /payment-methods/:id — Soft delete del método de pago (is_active = false)
export const remove = async (req: Request, res: Response): Promise<void> => {
  await deletePaymentMethodService(req.params.id as string);
  successResponse(res, null, 'Método de pago desactivado');
};
