import { Router } from 'express';
import { authMiddleware, requireAdmin } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { create_auth_schema, update_auth_schema } from './auth.service.js';
import { login_schema, refresh_schema } from './auth.session.service.js';
import { getAll, getOne, create, update, remove } from './auth.controller.js';
import { login, refresh, logout } from './auth.session.controller.js';

const router = Router();

// ─── Rutas de sesión ──────────────────────────────────────────────────────────

// POST /auth/login — Inicia sesión con email/teléfono y contraseña
router.post('/login', validate(login_schema), login);

// POST /auth/refresh — Rota el refresh token y emite un nuevo par de tokens
router.post('/refresh', validate(refresh_schema), refresh);

// POST /auth/logout — Revoca el refresh token del cliente
router.post('/logout', validate(refresh_schema), logout);

// ─── CRUD de registros auth (solo admin) ─────────────────────────────────────

// GET /auth — Lista todos los registros de autenticación
router.get('/', authMiddleware, requireAdmin, getAll);

// GET /auth/:id — Obtiene un registro de autenticación por id
router.get('/:id', authMiddleware, requireAdmin, getOne);

// POST /auth — Crea un nuevo registro de autenticación
router.post('/', authMiddleware, requireAdmin, validate(create_auth_schema), create);

// PUT /auth/:id — Actualiza email, phone o password
router.put('/:id', authMiddleware, requireAdmin, validate(update_auth_schema), update);

// DELETE /auth/:id — Elimina permanentemente (cascada a customer)
router.delete('/:id', authMiddleware, requireAdmin, remove);

export default router;
