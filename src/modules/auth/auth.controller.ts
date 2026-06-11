import { Request, Response } from 'express';
import { successResponse } from '../../utils/response.js';
import {
  getAllAuthService,
  getAuthByIdService,
  createAuthService,
  updateAuthService,
  deleteAuthService,
} from './auth.service.js';
import type { CreateAuthInput, UpdateAuthInput } from './auth.service.js';

// GET /auth — Lista todos los registros de autenticación
export const getAll = async (_req: Request, res: Response): Promise<void> => {
  const records = await getAllAuthService();
  successResponse(res, records);
};

// GET /auth/:id — Obtiene un registro de autenticación por id
export const getOne = async (req: Request, res: Response): Promise<void> => {
  const record = await getAuthByIdService(req.params.id as string);
  successResponse(res, record);
};

// POST /auth — Crea un nuevo registro de autenticación
export const create = async (req: Request, res: Response): Promise<void> => {
  const input = req.body as CreateAuthInput;
  const record = await createAuthService(input);
  successResponse(res, record, 'Registro de autenticación creado', 201);
};

// PUT /auth/:id — Actualiza email, phone o password de un registro
export const update = async (req: Request, res: Response): Promise<void> => {
  const input = req.body as UpdateAuthInput;
  const record = await updateAuthService(req.params.id as string, input);
  successResponse(res, record, 'Registro de autenticación actualizado');
};

// DELETE /auth/:id — Elimina permanentemente un registro de autenticación
export const remove = async (req: Request, res: Response): Promise<void> => {
  await deleteAuthService(req.params.id as string);
  successResponse(res, null, 'Registro de autenticación eliminado');
};
