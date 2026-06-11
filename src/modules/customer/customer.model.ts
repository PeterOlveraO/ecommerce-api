import { pool } from '../../config/db.js';
import { generateId } from '../../utils/uuid.js';

// Tipo que representa un registro de la tabla customer
export interface CustomerRecord {
  id: string;
  auth_id: string;
  first_name: string;
  last_name: string;
  country: string;
  street_address: string;
  interior_number: string | null;
  exterior_number: string;
  postal_code: string;
  city: string;
  state: string;
  phone: string;
  is_active: number;
}

// Payload para crear un cliente
export interface CreateCustomerPayload {
  auth_id: string;
  first_name: string;
  last_name: string;
  country?: string;
  street_address: string;
  interior_number?: string;
  exterior_number: string;
  postal_code: string;
  city: string;
  state: string;
  phone: string;
}

// Payload para actualizar un cliente (todos opcionales)
export interface UpdateCustomerPayload {
  first_name?: string;
  last_name?: string;
  country?: string;
  street_address?: string;
  interior_number?: string;
  exterior_number?: string;
  postal_code?: string;
  city?: string;
  state?: string;
  phone?: string;
}

// Columnas públicas a seleccionar (excluye is_active del payload de respuesta)
const SELECT_COLUMNS = `
  id, auth_id, first_name, last_name, country,
  street_address, interior_number, exterior_number,
  postal_code, city, state, phone, is_active
`;

// Obtiene todos los clientes activos
export const findAllCustomers = async (): Promise<CustomerRecord[]> => {
  const [rows] = await pool.query<CustomerRecord[] & any[]>(
    `SELECT ${SELECT_COLUMNS} FROM customer WHERE is_active = 1 ORDER BY first_name ASC`
  );
  return rows;
};

// Obtiene un cliente por su id (activo o inactivo)
export const findCustomerById = async (id: string): Promise<CustomerRecord | null> => {
  const [rows] = await pool.query<CustomerRecord[] & any[]>(
    `SELECT ${SELECT_COLUMNS} FROM customer WHERE id = ?`,
    [id]
  );
  return rows[0] ?? null;
};

// Verifica si ya existe un cliente con el auth_id dado
export const findCustomerByAuthId = async (auth_id: string): Promise<CustomerRecord | null> => {
  const [rows] = await pool.query<CustomerRecord[] & any[]>(
    `SELECT ${SELECT_COLUMNS} FROM customer WHERE auth_id = ?`,
    [auth_id]
  );
  return rows[0] ?? null;
};

// Inserta un nuevo cliente
export const createCustomer = async (payload: CreateCustomerPayload): Promise<CustomerRecord> => {
  const id = generateId();
  const country = payload.country ?? 'México';

  await pool.query(
    `INSERT INTO customer
      (id, auth_id, first_name, last_name, country, street_address,
       interior_number, exterior_number, postal_code, city, state, phone)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      payload.auth_id,
      payload.first_name,
      payload.last_name,
      country,
      payload.street_address,
      payload.interior_number ?? null,
      payload.exterior_number,
      payload.postal_code,
      payload.city,
      payload.state,
      payload.phone,
    ]
  );

  const created = await findCustomerById(id);
  return created!;
};

// Actualiza los campos proporcionados de un cliente
export const updateCustomer = async (
  id: string,
  payload: UpdateCustomerPayload
): Promise<CustomerRecord | null> => {
  const fields: string[] = [];
  const values: unknown[] = [];

  // Construye dinámicamente solo los campos enviados
  const updatable: (keyof UpdateCustomerPayload)[] = [
    'first_name', 'last_name', 'country', 'street_address',
    'interior_number', 'exterior_number', 'postal_code', 'city', 'state', 'phone',
  ];

  for (const key of updatable) {
    if (payload[key] !== undefined) {
      fields.push(`${key} = ?`);
      values.push(payload[key]);
    }
  }

  if (fields.length === 0) return findCustomerById(id);

  values.push(id);
  await pool.query(`UPDATE customer SET ${fields.join(', ')} WHERE id = ?`, values);

  return findCustomerById(id);
};

// Soft delete: marca el cliente como inactivo
export const softDeleteCustomer = async (id: string): Promise<void> => {
  await pool.query('UPDATE customer SET is_active = 0 WHERE id = ?', [id]);
};
