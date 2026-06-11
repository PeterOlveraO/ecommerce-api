import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AppError } from './error.middleware.js';

// Extiende el tipo Request para incluir el usuario autenticado
declare global {
  namespace Express {
    interface Request {
      user?: { id: string; role: 'admin' | 'customer' };
    }
  }
}

// Verifica el JWT del header Authorization e inyecta req.user
export const authMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const auth_header = req.headers.authorization;

  if (!auth_header || !auth_header.startsWith('Bearer ')) {
    throw new AppError('Token de acceso requerido', 401);
  }

  const token = auth_header.split(' ')[1];

  const payload = jwt.verify(token, env.jwt.secret) as {
    id: string;
    role: 'admin' | 'customer';
  };

  req.user = payload;
  next();
};

// Middleware adicional para rutas exclusivas de administrador
export const requireAdmin = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  if (req.user?.role !== 'admin') {
    throw new AppError('Acceso restringido a administradores', 403);
  }
  next();
};
