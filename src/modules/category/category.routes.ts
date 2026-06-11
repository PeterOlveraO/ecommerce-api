import { Router } from 'express';
import { authMiddleware, requireAdmin } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { create_category_schema, update_category_schema } from './category.service.js';
import * as CategoryController from './category.controller.js';

const router = Router();

// GET /categories — público (tienda pública las consume)
router.get('/', CategoryController.getAll);

// GET /categories/:id — público
router.get('/:id', CategoryController.getById);

// POST /categories — solo admin (CMS)
router.post('/', authMiddleware, requireAdmin, validate(create_category_schema), CategoryController.create);

// PUT /categories/:id — solo admin (CMS)
router.put('/:id', authMiddleware, requireAdmin, validate(update_category_schema), CategoryController.update);

// DELETE /categories/:id — solo admin (CMS)
router.delete('/:id', authMiddleware, requireAdmin, CategoryController.remove);

export default router;
