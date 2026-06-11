import { Router } from 'express';
import { z } from 'zod';
import { authMiddleware, requireAdmin } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import {
  listOrders,
  getOrder,
  createOrderHandler,
  updateOrderStatusHandler,
} from './order.controller.js';

const router = Router();

// Schema de validación para crear una orden
const create_order_schema = z.object({
  customer_id: z.string().uuid('customer_id debe ser un UUID válido'),
  payment_method_id: z.string().uuid('payment_method_id debe ser un UUID válido'),
  items: z
    .array(
      z.object({
        product_id: z.string().uuid('product_id debe ser un UUID válido'),
        quantity: z.number().int().positive('La cantidad debe ser un entero positivo'),
      })
    )
    .min(1, 'La orden debe contener al menos un artículo'),
  shipping_cost: z.number().min(0).optional(),
  notes: z.string().optional(),
});

// Schema de validación para actualizar el estado de la orden
const update_status_schema = z.object({
  status: z.enum(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'], {
    error: 'Estado inválido',
  }),
});

// GET /orders — requiere autenticación
router.get('/', authMiddleware, listOrders);

// GET /orders/:id — requiere autenticación
router.get('/:id', authMiddleware, getOrder);

// POST /orders — requiere autenticación
router.post('/', authMiddleware, validate(create_order_schema), createOrderHandler);

// PUT /orders/:id/status — solo admins
router.put(
  '/:id/status',
  authMiddleware,
  requireAdmin,
  validate(update_status_schema),
  updateOrderStatusHandler
);

export default router;
