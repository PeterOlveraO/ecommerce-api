import { pool } from '../../config/db.js';
import { generateId } from '../../utils/uuid.js';

export interface Attribute {
  id: string;
  name: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateAttributeData {
  name: string;
}

export interface UpdateAttributeData {
  name?: string;
}

export const AttributeModel = {
  async findAll(): Promise<Attribute[]> {
    const [rows] = await pool.query(
      'SELECT * FROM attribute WHERE is_active = 1 ORDER BY name ASC'
    );
    return rows as Attribute[];
  },

  async findById(id: string): Promise<Attribute | null> {
    const [rows] = await pool.query(
      'SELECT * FROM attribute WHERE id = ?',
      [id]
    );
    const results = rows as Attribute[];
    return results[0] ?? null;
  },

  async findByName(name: string): Promise<Attribute | null> {
    const [rows] = await pool.query(
      'SELECT * FROM attribute WHERE name = ?',
      [name]
    );
    const results = rows as Attribute[];
    return results[0] ?? null;
  },

  async create(data: CreateAttributeData): Promise<string> {
    const id = generateId();
    await pool.query(
      'INSERT INTO attribute (id, name) VALUES (?, ?)',
      [id, data.name]
    );
    return id;
  },

  async update(id: string, data: UpdateAttributeData): Promise<void> {
    const fields: string[] = [];
    const values: unknown[] = [];

    if (data.name !== undefined) {
      fields.push('name = ?');
      values.push(data.name);
    }

    if (fields.length === 0) return;

    values.push(id);
    await pool.query(
      `UPDATE attribute SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
  },

  async softDelete(id: string): Promise<void> {
    await pool.query(
      'UPDATE attribute SET is_active = 0 WHERE id = ?',
      [id]
    );
  },
};
