import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { errorMiddleware } from './middlewares/error.middleware.js';
import { authMiddleware } from './middlewares/auth.middleware.js';
import { validate } from './middlewares/validate.middleware.js';
import categoryRouter from './modules/category/category.routes.js';
import headerImageRouter from './modules/header_image/header_image.routes.js';
import authRoutes from './modules/auth/auth.routes.js';
import customerRoutes from './modules/customer/customer.routes.js';
import paymentMethodRoutes from './modules/payment-method/payment_method.routes.js';
import productRoutes from './modules/product/product.routes.js';
import orderRoutes from './modules/order/order.routes.js';
import attributeRouter from './modules/attribute/attribute.routes.js';
import uploadRouter from './modules/upload/upload.routes.js';
import { register, getMe, updateMe } from './modules/customer/customer.register.controller.js';
import { register_schema } from './modules/customer/customer.register.service.js';
import { update_customer_schema } from './modules/customer/customer.service.js';

const app = express();

const allowed_origins = [
  'https://vapezone.com.mx',
  'https://www.vapezone.com.mx',
  'https://admonvapezone.vapezone.com.mx',
  // Dominio temporal de Hostinger (mientras el dominio personalizado propaga)
  'https://floralwhite-wombat-793465.hostingersite.com',
];

// Middlewares de seguridad y utilidad
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({
  origin: (origin, callback) => {
    // Permite peticiones sin origin (Postman, curl, server-to-server)
    if (!origin) return callback(null, true);
    if (allowed_origins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS: origen no permitido: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(morgan('dev'));
app.use(express.json());

// Servir archivos estáticos (imágenes subidas)
app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));

// Ruta de salud del servidor
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Registro de módulos
app.use('/categories', categoryRouter);
app.use('/header-images', headerImageRouter);
app.use('/auth', authRoutes);
app.use('/customers', customerRoutes);
app.use('/payment-methods', paymentMethodRoutes);
app.use('/products', productRoutes);
app.use('/orders', orderRoutes);
app.use('/attributes', attributeRouter);
app.use('/upload', uploadRouter);

// ─── Rutas de cuenta propia ────────────────────────────────────────────────────

// POST /register — Registro unificado (auth + customer en una transacción)
app.post('/register', validate(register_schema), register);

// GET /me — Perfil del usuario autenticado
app.get('/me', authMiddleware, getMe);

// PUT /me — Actualiza el perfil del usuario autenticado
app.put('/me', authMiddleware, validate(update_customer_schema), updateMe);

// Manejador para rutas no encontradas (404)
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Ruta no encontrada' });
});

// Manejador global de errores — debe ir al final
app.use(errorMiddleware);

export default app;
