import { pool } from '../../config/db.js';
import { generateId } from '../../utils/uuid.js';

// Tipo que representa un registro de la tabla payment_method
export interface PaymentMethodRecord {
  id: string;
  method: string;
  bank: string;
  account_number: string;
  account_holder: string;
  is_active: number;
}

// Payload para crear un método de pago
export interface CreatePaymentMethodPayload {
  method: string;
  bank: string;
  account_number: string;
  account_holder: string;
}

// Payload para actualizar un método de pago (todos opcionales)
export interface UpdatePaymentMethodPayload {
  method?: string;
  bank?: string;
  account_number?: string;
  account_holder?: string;
}

// Obtiene todos los métodos de pago activos
export const findAllPaymentMethods = async (): Promise<PaymentMethodRecord[]> => {
  const [rows] = await pool.query<PaymentMethodRecord[] & any[]>(
    'SELECT id, method, bank, account_number, account_holder, is_active FROM payment_method WHERE is_active = 1 ORDER BY method ASC'
  );
  return rows;
};

// Obtiene un método de pago por su id
export const findPaymentMethodById = async (id: string): Promise<PaymentMethodRecord | null> => {
  const [rows] = await pool.query<PaymentMethodRecord[] & any[]>(
    'SELECT id, method, bank, account_number, account_holder, is_active FROM payment_method WHERE id = ?',
    [id]
  );
  return rows[0] ?? null;
};

// Inserta un nuevo método de pago
export const createPaymentMethod = async (
  payload: CreatePaymentMethodPayload
): Promise<PaymentMethodRecord> => {
  const id = generateId();

  await pool.query(
    'INSERT INTO payment_method (id, method, bank, account_number, account_holder) VALUES (?, ?, ?, ?, ?)',
    [id, payload.method, payload.bank, payload.account_number, payload.account_holder]
  );

  const created = await findPaymentMethodById(id);
  return created!;
};

// Actualiza los campos proporcionados de un método de pago
export const updatePaymentMethod = async (
  id: string,
  payload: UpdatePaymentMethodPayload
): Promise<PaymentMethodRecord | null> => {
  const fields: string[] = [];
  const values: unknown[] = [];

  // Construye dinámicamente solo los campos enviados
  const updatable: (keyof UpdatePaymentMethodPayload)[] = [
    'method', 'bank', 'account_number', 'account_holder',
  ];

  for (const key of updatable) {
    if (payload[key] !== undefined) {
      fields.push(`${key} = ?`);
      values.push(payload[key]);
    }
  }

  if (fields.length === 0) return findPaymentMethodById(id);

  values.push(id);
  await pool.query(`UPDATE payment_method SET ${fields.join(', ')} WHERE id = ?`, values);

  return findPaymentMethodById(id);
};

// Soft delete: marca el método de pago como inactivo
export const softDeletePaymentMethod = async (id: string): Promise<void> => {
  await pool.query('UPDATE payment_method SET is_active = 0 WHERE id = ?', [id]);
};
