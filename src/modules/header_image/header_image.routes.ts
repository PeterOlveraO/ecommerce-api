import { Router } from 'express';
import { authMiddleware, requireAdmin } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { create_header_image_schema, update_header_image_schema } from './header_image.service.js';
import * as HeaderImageController from './header_image.controller.js';

const router = Router();

// GET /header-images — público (tienda pública renderiza el banner)
router.get('/', HeaderImageController.getAll);

// GET /header-images/:id — público
router.get('/:id', HeaderImageController.getById);

// POST /header-images — solo admin (CMS)
router.post('/', authMiddleware, requireAdmin, validate(create_header_image_schema), HeaderImageController.create);

// PUT /header-images/:id — solo admin (CMS)
router.put('/:id', authMiddleware, requireAdmin, validate(update_header_image_schema), HeaderImageController.update);

// DELETE /header-images/:id — solo admin (CMS)
router.delete('/:id', authMiddleware, requireAdmin, HeaderImageController.remove);

export default router;
