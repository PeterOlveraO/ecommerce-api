import { Request, Response } from 'express';
import { CategoryService } from './category.service.js';
import { successResponse } from '../../utils/response.js';

// Devuelve todas las categorías activas
export const getAll = async (_req: Request, res: Response): Promise<void> => {
  const categories = await CategoryService.getAll();
  successResponse(res, categories, 'Categorías obtenidas correctamente');
};

// Devuelve una categoría por su id
export const getById = async (req: Request, res: Response): Promise<void> => {
  const category = await CategoryService.getById(req.params.id as string);
  successResponse(res, category, 'Categoría obtenida correctamente');
};

// Crea una nueva categoría con los datos del body (ya validados por Zod)
export const create = async (req: Request, res: Response): Promise<void> => {
  const category = await CategoryService.create(req.body);
  successResponse(res, category, 'Categoría creada correctamente', 201);
};

// Actualiza una categoría existente con los datos del body (ya validados por Zod)
export const update = async (req: Request, res: Response): Promise<void> => {
  const category = await CategoryService.update(req.params.id as string, req.body);
  successResponse(res, category, 'Categoría actualizada correctamente');
};

// Realiza un borrado suave de la categoría
export const remove = async (req: Request, res: Response): Promise<void> => {
  await CategoryService.remove(req.params.id as string);
  successResponse(res, null, 'Categoría eliminada correctamente');
};
