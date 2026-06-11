import { Request, Response } from 'express';
import { successResponse } from '../../utils/response.js';
import {
  getAllCustomersService,
  getCustomerByIdService,
  createCustomerService,
  updateCustomerService,
  deleteCustomerService,
} from './customer.service.js';
import type { CreateCustomerInput, UpdateCustomerInput } from './customer.service.js';

// GET /customers — Lista todos los clientes activos
export const getAll = async (_req: Request, res: Response): Promise<void> => {
  const customers = await getAllCustomersService();
  successResponse(res, customers);
};

// GET /customers/:id — Obtiene un cliente por id
export const getOne = async (req: Request, res: Response): Promise<void> => {
  const customer = await getCustomerByIdService(req.params.id as string);
  successResponse(res, customer);
};

// POST /customers — Crea un nuevo perfil de cliente
export const create = async (req: Request, res: Response): Promise<void> => {
  const input = req.body as CreateCustomerInput;
  const customer = await createCustomerService(input);
  successResponse(res, customer, 'Cliente creado', 201);
};

// PUT /customers/:id — Actualiza los datos de un cliente
export const update = async (req: Request, res: Response): Promise<void> => {
  const input = req.body as UpdateCustomerInput;
  const customer = await updateCustomerService(req.params.id as string, input);
  successResponse(res, customer, 'Cliente actualizado');
};

// DELETE /customers/:id — Soft delete del cliente (is_active = false)
export const remove = async (req: Request, res: Response): Promise<void> => {
  await deleteCustomerService(req.params.id as string);
  successResponse(res, null, 'Cliente desactivado');
};
