import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { generateId } from '../utils/uuid.js';
import { AppError } from './error.middleware.js';
import { env } from '../config/env.js';

// Carpeta de uploads — la ruta se define en .env (UPLOAD_DIR) para soportar dev y producción
const uploadDir = env.upload_dir;
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = generateId();
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Tipo de archivo no soportado. Solo se permiten imágenes (JPEG, PNG, WEBP, GIF).', 400));
  }
};

export const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // Límite de 5MB por imagen
  }
});
