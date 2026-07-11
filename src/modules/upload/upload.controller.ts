import { Request, Response } from "express";
import { successResponse } from "../../utils/response.js";
import { AppError } from "../../middlewares/error.middleware.js";
import { env } from "../../config/env.js";

export const uploadImage = (req: Request, res: Response) => {
  if (!req.file) {
    throw new AppError(
      'No se proporcionó ninguna imagen en el campo "image".',
      400,
    );
  }

  // Se construye la URL pública usando la base definida en .env (UPLOAD_BASE_URL)
  const imageUrl = `${env.upload_base_url}/${req.file.filename}`;

  successResponse(res, { url: imageUrl }, "Imagen subida exitosamente", 201);
};
