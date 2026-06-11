import { Router } from 'express';
import { authMiddleware, requireAdmin } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { create_customer_schema, update_customer_schema } from './customer.service.js';
import { getAll, getOne, create, update, remove } from './customer.controller.js';

const router = Router();

// GET /customers — solo admin (CMS ve el listado completo)
router.get('/', authMiddleware, requireAdmin, getAll);

// GET /customers/:id — requiere auth (cliente ve su propio perfil)
router.get('/:id', authMiddleware, getOne);

// POST /customers — público (parte del flujo de registro)
router.post('/', validate(create_customer_schema), create);

// PUT /customers/:id — requiere auth (cliente edita su perfil)
router.put('/:id', authMiddleware, validate(update_customer_schema), update);

// DELETE /customers/:id — solo admin (CMS)
router.delete('/:id', authMiddleware, requireAdmin, remove);

export default router;
