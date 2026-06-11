import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { env } from '../../config/env.js';
import { AppError } from '../../middlewares/error.middleware.js';
import { findAuthByEmailOrPhone } from './auth.model.js';

// ─── Schemas Zod ──────────────────────────────────────────────────────────────

// Schema para login: acepta email o teléfono como identificador
export const login_schema = z.object({
  identifier: z.string().min(1, { message: 'Email o teléfono requerido' }),
  password:   z.string().min(1, { message: 'Contraseña requerida' }),
});

// Schema para refresh: solo necesita el refresh token
export const refresh_schema = z.object({
  refresh_token: z.string().min(1, { message: 'Refresh token requerido' }),
});

export type LoginInput   = z.infer<typeof login_schema>;
export type RefreshInput = z.infer<typeof refresh_schema>;

// ─── Payload del JWT ──────────────────────────────────────────────────────────

interface JwtPayload {
  id:   string;
  role: 'admin' | 'customer';
}

// ─── Blacklist de refresh tokens revocados (en memoria) ───────────────────────
// En producción esto debería vivir en Redis o en la DB
const revoked_tokens = new Set<string>();

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Genera un access token de corta duración
const sign_access_token = (payload: JwtPayload): string =>
  jwt.sign(payload, env.jwt.secret, { expiresIn: env.jwt.expires_in as any });

// Genera un refresh token de larga duración
const sign_refresh_token = (payload: JwtPayload): string =>
  jwt.sign(payload, env.jwt.refresh_secret, { expiresIn: env.jwt.refresh_expires_in as any });

// ─── Servicios ────────────────────────────────────────────────────────────────

// Valida credenciales y devuelve ambos tokens
export const loginService = async (input: LoginInput) => {
  // Busca el usuario por email o teléfono
  const user = await findAuthByEmailOrPhone(input.identifier);
  if (!user) throw new AppError('Credenciales inválidas', 401);

  // Compara la contraseña con el hash almacenado
  const is_valid = await bcrypt.compare(input.password, user.password);
  if (!is_valid) throw new AppError('Credenciales inválidas', 401);

  const payload: JwtPayload = { id: user.id, role: user.role };

  return {
    access_token:  sign_access_token(payload),
    refresh_token: sign_refresh_token(payload),
    user: {
      id:    user.id,
      email: user.email,
      phone: user.phone,
      role:  user.role,
    },
  };
};

// Verifica el refresh token y emite un nuevo par de tokens
export const refreshService = (input: RefreshInput) => {
  const { refresh_token } = input;

  // Rechaza tokens revocados (logout previo)
  if (revoked_tokens.has(refresh_token)) {
    throw new AppError('Refresh token inválido o expirado', 401);
  }

  // Verifica la firma y expiración del refresh token
  const payload = jwt.verify(refresh_token, env.jwt.refresh_secret) as JwtPayload;

  // Rota el refresh token — invalida el anterior e isssue uno nuevo
  revoked_tokens.add(refresh_token);

  const new_payload: JwtPayload = { id: payload.id, role: payload.role };

  return {
    access_token:  sign_access_token(new_payload),
    refresh_token: sign_refresh_token(new_payload),
  };
};

// Revoca el refresh token — el access token expira solo por TTL
export const logoutService = (input: RefreshInput): void => {
  revoked_tokens.add(input.refresh_token);
};
