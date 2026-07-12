import { Request, Response, NextFunction } from "express";

// Clase de error personalizada con código HTTP
export class AppError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.name = "AppError";
  }
}

// Manejador global de errores — debe ser el último middleware registrado
export const errorMiddleware = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

  // Capturar errores de validación y expiración de JWT globalmente
  if (err.name === "TokenExpiredError") {
    res.status(401).json({
      success: false,
      message: "El token ha expirado",
    });
    return;
  }

  if (err.name === "JsonWebTokenError") {
    res.status(401).json({
      success: false,
      message: "Token inválido",
    });
    return;
  }

  // Error inesperado — no exponer detalles en producción
  console.error("Error inesperado:", err);
  res.status(500).json({
    success: false,
    message: "Error interno del servidor",
  });
};
