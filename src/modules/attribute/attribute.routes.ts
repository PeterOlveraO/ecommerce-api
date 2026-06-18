import { Router } from 'express';
import { authMiddleware, requireAdmin } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { create_attribute_schema, update_attribute_schema } from './attribute.service.js';
import * as AttributeController from './attribute.controller.js';

const router = Router();

// GET /attributes — público
router.get('/', AttributeController.getAll);

// GET /attributes/:id — público
router.get('/:id', AttributeController.getById);

// POST /attributes — solo admin
router.post('/', authMiddleware, requireAdmin, validate(create_attribute_schema), AttributeController.create);

// PUT /attributes/:id — solo admin
router.put('/:id', authMiddleware, requireAdmin, validate(update_attribute_schema), AttributeController.update);

// DELETE /attributes/:id — solo admin
router.delete('/:id', authMiddleware, requireAdmin, AttributeController.remove);

export default router;
