import { Request, Response } from 'express';
import { HeaderImageService } from './header_image.service.js';
import { successResponse } from '../../utils/response.js';

// Devuelve todas las imágenes de cabecera activas
export const getAll = async (_req: Request, res: Response): Promise<void> => {
  const images = await HeaderImageService.getAll();
  successResponse(res, images, 'Imágenes de cabecera obtenidas correctamente');
};

// Devuelve una imagen de cabecera por su id
export const getById = async (req: Request, res: Response): Promise<void> => {
  const image = await HeaderImageService.getById(req.params.id as string);
  successResponse(res, image, 'Imagen de cabecera obtenida correctamente');
};

// Crea una nueva imagen de cabecera con los datos del body (ya validados por Zod)
export const create = async (req: Request, res: Response): Promise<void> => {
  const image = await HeaderImageService.create(req.body);
  successResponse(res, image, 'Imagen de cabecera creada correctamente', 201);
};

// Actualiza una imagen de cabecera existente con los datos del body (ya validados por Zod)
export const update = async (req: Request, res: Response): Promise<void> => {
  const image = await HeaderImageService.update(req.params.id as string, req.body);
  successResponse(res, image, 'Imagen de cabecera actualizada correctamente');
};

// Realiza un borrado suave de la imagen de cabecera
export const remove = async (req: Request, res: Response): Promise<void> => {
  await HeaderImageService.remove(req.params.id as string);
  successResponse(res, null, 'Imagen de cabecera eliminada correctamente');
};
