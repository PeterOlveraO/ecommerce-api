import { Request, Response } from 'express';
import { successResponse, paginatedResponse } from '../../utils/response.js';
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProductById,
  deleteProductById,
} from './product.service.js';

// GET /products — lista productos activos con paginación y filtros opcionales
// Query params: page, limit, search, category_id
export const listProducts = async (req: Request, res: Response) => {
  const { data, total, page, limit } = await getAllProducts(req.query as any);
  paginatedResponse(res, data, total, page, limit, 'Productos obtenidos correctamente');
};

// GET /products/:id — obtiene un producto con sus categorías
export const getProduct = async (req: Request, res: Response) => {
  const product = await getProductById(req.params.id as string);
  successResponse(res, product, 'Producto obtenido correctamente');
};

// POST /products — crea un producto nuevo
export const createProductHandler = async (req: Request, res: Response) => {
  const product = await createProduct(req.body);
  successResponse(res, product, 'Producto creado correctamente', 201);
};

// PUT /products/:id — actualiza un producto
export const updateProductHandler = async (req: Request, res: Response) => {
  const product = await updateProductById(req.params.id as string, req.body);
  successResponse(res, product, 'Producto actualizado correctamente');
};

// DELETE /products/:id — soft delete del producto
export const deleteProductHandler = async (req: Request, res: Response) => {
  await deleteProductById(req.params.id as string);
  successResponse(res, null, 'Producto desactivado correctamente');
};
