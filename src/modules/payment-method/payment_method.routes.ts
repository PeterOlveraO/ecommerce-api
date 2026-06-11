import { Router } from 'express';
import { authMiddleware, requireAdmin } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import {
  create_payment_method_schema,
  update_payment_method_schema,
} from './payment_method.service.js';
import { getAll, getOne, create, update, remove } from './payment_method.controller.js';

const router = Router();

// GET /payment-methods — público (tienda pública los muestra al hacer checkout)
router.get('/', getAll);

// GET /payment-methods/:id — público
router.get('/:id', getOne);

// POST /payment-methods — solo admin (CMS)
router.post('/', authMiddleware, requireAdmin, validate(create_payment_method_schema), create);

// PUT /payment-methods/:id — solo admin (CMS)
router.put('/:id', authMiddleware, requireAdmin, validate(update_payment_method_schema), update);

// DELETE /payment-methods/:id — solo admin (CMS)
router.delete('/:id', authMiddleware, requireAdmin, remove);

export default router;
