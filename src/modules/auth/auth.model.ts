import bcrypt from 'bcryptjs';
import { pool } from '../../config/db.js';
import { generateId } from '../../utils/uuid.js';

// Tipo que representa un registro de la tabla auth
export interface AuthRecord {
  id: string;
  email: string | null;
  phone: string | null;
  password: string;
  role: 'admin' | 'customer';
  created_at: Date;
  updated_at: Date;
}

// Payload para crear un registro auth
export interface CreateAuthPayload {
  email?: string;
  phone?: string;
  password: string;
  role?: 'admin' | 'customer';
}

// Payload para actualizar un registro auth
export interface UpdateAuthPayload {
  email?: string;
  phone?: string;
  password?: string;
}

// Obtiene todos los registros de auth activos
export const findAllAuth = async (): Promise<AuthRecord[]> => {
  const [rows] = await pool.query<AuthRecord[] & any[]>(
    'SELECT id, email, phone, role, created_at, updated_at FROM auth WHERE is_active = 1 ORDER BY created_at DESC'
  );
  return rows;
};

// Obtiene un registro auth por su id
export const findAuthById = async (id: string): Promise<AuthRecord | null> => {
  const [rows] = await pool.query<AuthRecord[] & any[]>(
    'SELECT id, email, phone, role, created_at, updated_at FROM auth WHERE id = ?',
    [id]
  );
  return rows[0] ?? null;
};

// Obtiene un registro auth por email (incluye password para validación)
export const findAuthByEmail = async (email: string): Promise<AuthRecord | null> => {
  const [rows] = await pool.query<AuthRecord[] & any[]>(
    'SELECT * FROM auth WHERE email = ?',
    [email]
  );
  return rows[0] ?? null;
};

// Obtiene un registro auth por teléfono (incluye password para validación)
export const findAuthByPhone = async (phone: string): Promise<AuthRecord | null> => {
  const [rows] = await pool.query<AuthRecord[] & any[]>(
    'SELECT * FROM auth WHERE phone = ?',
    [phone]
  );
  return rows[0] ?? null;
};

// Inserta un nuevo registro auth con password hasheado
export const createAuth = async (payload: CreateAuthPayload): Promise<AuthRecord> => {
  const id = generateId();
  const hashed = await bcrypt.hash(payload.password, 10);
  const role = payload.role ?? 'customer';

  await pool.query(
    'INSERT INTO auth (id, email, phone, password, role) VALUES (?, ?, ?, ?, ?)',
    [id, payload.email ?? null, payload.phone ?? null, hashed, role]
  );

  // Retorna el registro recién creado (sin password)
  const created = await findAuthById(id);
  return created!;
};

// Actualiza email, phone o password de un registro auth
export const updateAuth = async (
  id: string,
  payload: UpdateAuthPayload
): Promise<AuthRecord | null> => {
  const fields: string[] = [];
  const values: unknown[] = [];

  if (payload.email !== undefined) {
    fields.push('email = ?');
    values.push(payload.email);
  }
  if (payload.phone !== undefined) {
    fields.push('phone = ?');
    values.push(payload.phone);
  }
  if (payload.password !== undefined) {
    // Re-hashea la contraseña si se actualiza
    const hashed = await bcrypt.hash(payload.password, 10);
    fields.push('password = ?');
    values.push(hashed);
  }

  if (fields.length === 0) return findAuthById(id);

  values.push(id);
  await pool.query(`UPDATE auth SET ${fields.join(', ')} WHERE id = ?`, values);

  return findAuthById(id);
};

// Elimina un registro auth de forma lógica (soft delete)
export const deleteAuth = async (id: string): Promise<void> => {
  await pool.query('UPDATE auth SET is_active = 0 WHERE id = ?', [id]);
};

// Busca un registro auth activo por email o teléfono (para login) — incluye password
export const findAuthByEmailOrPhone = async (
  identifier: string
): Promise<AuthRecord | null> => {
  const [rows] = await pool.query<AuthRecord[] & any[]>(
    'SELECT * FROM auth WHERE (email = ? OR phone = ?) AND is_active = 1',
    [identifier, identifier]
  );
  return rows[0] ?? null;
};
