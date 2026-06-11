import { Response } from 'express';

// Respuesta estándar de éxito
export const successResponse = (
  res: Response,
  data: unknown,
  message = 'OK',
  statusCode = 200
): Response => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

// Respuesta paginada estándar
export const paginatedResponse = (
  res: Response,
  data: unknown,
  total: number,
  page: number,
  limit: number,
  message = 'OK'
): Response => {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      total,
      page,
      limit,
      total_pages: Math.ceil(total / limit),
    },
  });
};
