import { Request, Response } from 'express';
import { AttributeService } from './attribute.service.js';
import { successResponse } from '../../utils/response.js';

export const getAll = async (_req: Request, res: Response) => {
  const attributes = await AttributeService.getAll();
  return successResponse(res, attributes, 'Atributos obtenidos');
};

export const getById = async (req: Request, res: Response) => {
  const attribute = await AttributeService.getById(req.params.id);
  return successResponse(res, attribute, 'Atributo obtenido');
};

export const create = async (req: Request, res: Response) => {
  const attribute = await AttributeService.create(req.body);
  return successResponse(res, attribute, 'Atributo creado', 201);
};

export const update = async (req: Request, res: Response) => {
  const attribute = await AttributeService.update(req.params.id, req.body);
  return successResponse(res, attribute, 'Atributo actualizado');
};

export const remove = async (req: Request, res: Response) => {
  await AttributeService.remove(req.params.id);
  return successResponse(res, null, 'Atributo eliminado');
};
