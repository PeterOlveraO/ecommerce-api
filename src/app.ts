import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
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
import { register, getMe, updateMe } from './modules/customer/customer.register.controller.js';
import { register_schema } from './modules/customer/customer.register.service.js';
import { update_customer_schema } from './modules/customer/customer.service.js';

const app = express();

// Middlewares de seguridad y utilidad
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

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

// ─── Rutas de cuenta propia ────────────────────────────────────────────────────

// POST /register — Registro unificado (auth + customer en una transacción)
app.post('/register', validate(register_schema), register);

// GET /me — Perfil del usuario autenticado
app.get('/me', authMiddleware, getMe);

// PUT /me — Actualiza el perfil del usuario autenticado
app.put('/me', authMiddleware, validate(update_customer_schema), updateMe);

// Manejador global de errores — debe ir al final
app.use(errorMiddleware);

export default app;
