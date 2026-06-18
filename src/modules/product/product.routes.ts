import { Router } from 'express';
import { z } from 'zod';
import { authMiddleware, requireAdmin } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import {
  listProducts,
  getProduct,
  createProductHandler,
  updateProductHandler,
  deleteProductHandler,
} from './product.controller.js';

const router = Router();

// Schema de validación para crear un producto
const create_product_schema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(150),
  brand: z.string().min(1, 'La marca es requerida').max(100),
  description: z.string().optional(),
  price: z.number().positive('El precio debe ser mayor a 0'),
  sale_price: z.number().positive().optional(),
  stock: z.number().int().min(0).optional(),
  details: z.unknown().optional(),
  image_url: z.string().url('La URL de la imagen no es válida').max(255).nullable().optional(),
  display_order: z.number().int().min(0),
  featured: z.boolean().optional().default(false),
  category_ids: z.array(z.string().uuid()).optional(),
}).refine(
  (data) => data.sale_price === undefined || data.sale_price < data.price,
  { message: 'El precio de oferta debe ser menor al precio regular', path: ['sale_price'] }
);

// Schema de validación para actualizar un producto (todos los campos opcionales)
const update_product_schema = z.object({
  name: z.string().min(1).max(150).optional(),
  brand: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  sale_price: z.number().positive().optional(),
  stock: z.number().int().min(0).optional(),
  details: z.unknown().optional(),
  image_url: z.string().url().max(255).nullable().optional(),
  display_order: z.number().int().min(0).optional(),
  featured: z.boolean().optional(),
  category_ids: z.array(z.string().uuid()).optional(),
});

// GET /products — público
router.get('/', listProducts);

// GET /products/:id — público
router.get('/:id', getProduct);

// POST /products — solo admins
router.post(
  '/',
  authMiddleware,
  requireAdmin,
  validate(create_product_schema),
  createProductHandler
);

// PUT /products/:id — solo admins
router.put(
  '/:id',
  authMiddleware,
  requireAdmin,
  validate(update_product_schema),
  updateProductHandler
);

// DELETE /products/:id — solo admins
router.delete('/:id', authMiddleware, requireAdmin, deleteProductHandler);

export default router;
