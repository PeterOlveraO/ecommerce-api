import { Request, Response } from 'express';
import { successResponse } from '../../utils/response.js';
import { AppError } from '../../middlewares/error.middleware.js';

export const uploadImage = (req: Request, res: Response) => {
  if (!req.file) {
    throw new AppError('No se proporcionó ninguna imagen en el campo "image".', 400);
  }

  // Se devuelve la URL pública de la imagen
  const imageUrl = `/uploads/${req.file.filename}`;

  successResponse(res, { url: imageUrl }, 'Imagen subida exitosamente', 201);
};
