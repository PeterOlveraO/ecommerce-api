import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { AppError } from './error.middleware.js';

// Factory que devuelve un middleware de validación para el schema dado
export const validate = (schema: ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      // Concatena todos los errores de validación en un solo mensaje (Zod v4 usa .issues)
      const message = result.error.issues
        .map((e) => `${e.path.map(String).join('.')}: ${e.message}`)
        .join(', ');
      throw new AppError(message, 400);
    }

    // Reemplaza req.body con los datos ya validados y tipados
    req.body = result.data;
    next();
  };
};
