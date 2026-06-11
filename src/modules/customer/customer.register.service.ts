import { PoolConnection } from 'mysql2/promise';
import { z } from 'zod';
import { pool } from '../../config/db.js';
import { generateId } from '../../utils/uuid.js';
import { AppError } from '../../middlewares/error.middleware.js';
import { findAuthByEmail, findAuthByPhone } from '../auth/auth.model.js';
import { findCustomerByAuthId } from '../customer/customer.model.js';
import bcrypt from 'bcryptjs';

// ─── Schema de registro unificado ────────────────────────────────────────────

export const register_schema = z.object({
  // Credenciales (al menos una)
  email:    z.string().email({ message: 'Email inválido' }).optional(),
  phone:    z.string().min(7, { message: 'Teléfono muy corto' }).optional(),
  password: z.string().min(6, { message: 'La contraseña debe tener al menos 6 caracteres' }),

  // Datos del perfil
  first_name:       z.string().min(1, { message: 'Nombre requerido' }).max(100),
  last_name:        z.string().min(1, { message: 'Apellido requerido' }).max(100),
  country:          z.string().max(100).optional().default('México'),
  street_address:   z.string().min(1, { message: 'Dirección requerida' }).max(255),
  interior_number:  z.string().max(50).optional(),
  exterior_number:  z.string().min(1, { message: 'Número exterior requerido' }).max(50),
  postal_code:      z.string().min(1, { message: 'Código postal requerido' }).max(10),
  city:             z.string().min(1, { message: 'Ciudad requerida' }).max(100),
  state:            z.string().min(1, { message: 'Estado requerido' }).max(100),
  phone_contact:    z.string().min(7, { message: 'Teléfono de contacto requerido' }).max(20),
});

export type RegisterInput = z.infer<typeof register_schema>;

// ─── Servicio de registro ──────────────────────────────────────────────────────

export const registerService = async (input: RegisterInput) => {
  // Requiere al menos email o teléfono para las credenciales
  if (!input.email && !input.phone) {
    throw new AppError('Se requiere al menos email o teléfono', 400);
  }

  // Verifica unicidad de email antes de abrir transacción
  if (input.email) {
    const existing = await findAuthByEmail(input.email);
    if (existing) throw new AppError('El email ya está registrado', 409);
  }

  if (input.phone) {
    const existing = await findAuthByPhone(input.phone);
    if (existing) throw new AppError('El teléfono ya está registrado', 409);
  }

  // Transacción atómica: si falla cualquier INSERT se hace rollback completo
  const connection: PoolConnection = await pool.getConnection();
  await connection.beginTransaction();

  try {
    const auth_id     = generateId();
    const customer_id = generateId();
    const hashed      = await bcrypt.hash(input.password, 10);

    // 1. Inserta el registro de autenticación
    await connection.query(
      'INSERT INTO auth (id, email, phone, password, role) VALUES (?, ?, ?, ?, ?)',
      [auth_id, input.email ?? null, input.phone ?? null, hashed, 'customer']
    );

    // 2. Inserta el perfil del cliente
    await connection.query(
      `INSERT INTO customer
        (id, auth_id, first_name, last_name, country, street_address,
         interior_number, exterior_number, postal_code, city, state, phone)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        customer_id,
        auth_id,
        input.first_name,
        input.last_name,
        input.country,
        input.street_address,
        input.interior_number ?? null,
        input.exterior_number,
        input.postal_code,
        input.city,
        input.state,
        input.phone_contact,
      ]
    );

    await connection.commit();

    // Retorna los datos públicos del usuario recién creado
    return {
      auth_id,
      customer_id,
      email:      input.email ?? null,
      phone:      input.phone ?? null,
      role:       'customer',
      first_name: input.first_name,
      last_name:  input.last_name,
    };
  } catch (error) {
    // Rollback si cualquier query falla
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// ─── Schema y servicio para GET /me ───────────────────────────────────────────

// Obtiene el perfil completo del usuario autenticado
export const getMeService = async (auth_id: string) => {
  const customer = await findCustomerByAuthId(auth_id);
  if (!customer) throw new AppError('Perfil de cliente no encontrado', 404);
  return customer;
};
