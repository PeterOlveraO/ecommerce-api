import { Request, Response } from 'express';
import { successResponse } from '../../utils/response.js';
import {
  loginService,
  refreshService,
  logoutService,
} from './auth.session.service.js';
import type { LoginInput, RefreshInput } from './auth.session.service.js';

// POST /auth/login — Valida credenciales y devuelve access + refresh token
export const login = async (req: Request, res: Response): Promise<void> => {
  const input  = req.body as LoginInput;
  const result = await loginService(input);
  successResponse(res, result, 'Login exitoso');
};

// POST /auth/refresh — Rota el refresh token y emite un nuevo par
export const refresh = (req: Request, res: Response): void => {
  const input  = req.body as RefreshInput;
  const result = refreshService(input);
  successResponse(res, result, 'Tokens renovados');
};

// POST /auth/logout — Revoca el refresh token del cliente
export const logout = (req: Request, res: Response): void => {
  const input = req.body as RefreshInput;
  logoutService(input);
  successResponse(res, null, 'Sesión cerrada correctamente');
};
