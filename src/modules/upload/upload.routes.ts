import { Router } from 'express';
import { uploadImage } from './upload.controller.js';
import { uploadMiddleware } from '../../middlewares/upload.middleware.js';
import { authMiddleware, requireAdmin } from '../../middlewares/auth.middleware.js';

const router = Router();

// POST /upload
// Requiere autenticación y rol de administrador.
// El archivo debe enviarse en el campo 'image' de form-data.
router.post('/', authMiddleware, requireAdmin, uploadMiddleware.single('image'), uploadImage);

export default router;
