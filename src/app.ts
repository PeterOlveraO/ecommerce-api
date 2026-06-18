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

// Middlewares de seguridad y utilidad
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Servir archivos estáticos (imágenes subidas)
app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));

// Ruta de salud del servidor
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Ruta de verificación de variables de entorno (solo en development)
app.get('/env-check', (_req, res) => {
  // Solo disponible en entorno de desarrollo
  if (process.env.NODE_ENV !== 'development') {
    res.status(403).json({ success: false, message: 'No disponible en producción' });
    return;
  }

  // Verifica si la variable existe (sin importar su contenido)
  const check = (value: string | undefined): string =>
    value ? '✅ DEFINIDA' : '❌ NO DEFINIDA';

  const variables = [
    // ─── Servidor ───────────────────────────────────────────────────────────
    { grupo: 'Servidor', variable: 'PORT',                    estado: check(process.env.PORT) },
    { grupo: 'Servidor', variable: 'NODE_ENV',                estado: check(process.env.NODE_ENV) },

    // ─── Base de Datos ───────────────────────────────────────────────────────
    { grupo: 'Base de Datos', variable: 'DB_HOST',            estado: check(process.env.DB_HOST) },
    { grupo: 'Base de Datos', variable: 'DB_PORT',            estado: check(process.env.DB_PORT) },
    { grupo: 'Base de Datos', variable: 'DB_USER',            estado: check(process.env.DB_USER) },
    { grupo: 'Base de Datos', variable: 'DB_PASSWORD',        estado: check(process.env.DB_PASSWORD) },
    { grupo: 'Base de Datos', variable: 'DB_NAME',            estado: check(process.env.DB_NAME) },

    // ─── JWT ────────────────────────────────────────────────────────────────
    { grupo: 'JWT', variable: 'JWT_SECRET',                   estado: check(process.env.JWT_SECRET) },
    { grupo: 'JWT', variable: 'JWT_REFRESH_SECRET',           estado: check(process.env.JWT_REFRESH_SECRET) },
    { grupo: 'JWT', variable: 'JWT_EXPIRES_IN',               estado: check(process.env.JWT_EXPIRES_IN) },
    { grupo: 'JWT', variable: 'JWT_REFRESH_EXPIRES_IN',       estado: check(process.env.JWT_REFRESH_EXPIRES_IN) },
  ];

  // Cuenta cuántas variables están definidas
  const total    = variables.length;
  const ok       = variables.filter(v => v.estado === '✅ DEFINIDA').length;
  const missing  = total - ok;

  // HTML con tabla visual para ver en el navegador
  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Variables de Entorno — Ecommerce Angel API</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Segoe UI', system-ui, sans-serif;
      background: #0f1117;
      color: #e2e8f0;
      min-height: 100vh;
      padding: 2rem;
    }
    .container { max-width: 860px; margin: 0 auto; }
    header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 2rem;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid #2d3748;
    }
    h1 { font-size: 1.5rem; font-weight: 700; }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: .4rem;
      padding: .25rem .75rem;
      border-radius: 9999px;
      font-size: .8rem;
      font-weight: 600;
    }
    .badge-ok  { background: #065f46; color: #6ee7b7; }
    .badge-err { background: #7f1d1d; color: #fca5a5; }
    .summary {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
    }
    .card {
      flex: 1;
      background: #1a202c;
      border-radius: .75rem;
      padding: 1.25rem 1.5rem;
      border: 1px solid #2d3748;
    }
    .card .num  { font-size: 2rem; font-weight: 800; }
    .card .lbl  { font-size: .8rem; color: #718096; margin-top: .25rem; }
    .num-ok    { color: #6ee7b7; }
    .num-miss  { color: #fca5a5; }
    .num-total { color: #90cdf4; }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: .9rem;
    }
    thead th {
      text-align: left;
      padding: .6rem 1rem;
      background: #1a202c;
      color: #718096;
      font-size: .75rem;
      text-transform: uppercase;
      letter-spacing: .08em;
      border-bottom: 1px solid #2d3748;
    }
    tbody tr { border-bottom: 1px solid #1a202c; }
    tbody tr:hover { background: #1a202c; }
    td {
      padding: .65rem 1rem;
      vertical-align: middle;
    }
    .grupo-cell {
      color: #718096;
      font-size: .8rem;
      white-space: nowrap;
    }
    .var-name {
      font-family: 'Courier New', monospace;
      color: #90cdf4;
      font-size: .85rem;
    }
    .val-ok   { color: #6ee7b7; font-weight: 600; }
    .val-miss { color: #fca5a5; font-weight: 600; }
    footer {
      margin-top: 2rem;
      padding-top: 1rem;
      border-top: 1px solid #2d3748;
      font-size: .75rem;
      color: #4a5568;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>🔍 Variables de Entorno</h1>
      <span class="badge ${missing === 0 ? 'badge-ok' : 'badge-err'}">
        ${missing === 0 ? '✅ Todo configurado' : '⚠️ ' + missing + ' faltante(s)'}
      </span>
    </header>

    <div class="summary">
      <div class="card">
        <div class="num num-total">${total}</div>
        <div class="lbl">Total de variables</div>
      </div>
      <div class="card">
        <div class="num num-ok">${ok}</div>
        <div class="lbl">Definidas</div>
      </div>
      <div class="card">
        <div class="num num-miss">${missing}</div>
        <div class="lbl">Faltantes</div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Grupo</th>
          <th>Variable</th>
          <th>Estado</th>
        </tr>
      </thead>
      <tbody>
        ${variables.map(v => {
          const isMissing = v.estado === '❌ NO DEFINIDA';
          const valClass  = isMissing ? 'val-miss' : 'val-ok';
          return `<tr>
            <td class="grupo-cell">${v.grupo}</td>
            <td><span class="var-name">${v.variable}</span></td>
            <td class="${valClass}">${v.estado}</td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>

    <footer>
      Ecommerce Angel API &nbsp;·&nbsp; Solo visible en <strong>development</strong>
    </footer>
  </div>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(html);
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
