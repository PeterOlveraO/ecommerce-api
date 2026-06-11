import { pool } from '../../config/db.js';
import { generateId } from '../../utils/uuid.js';

// Tipado que refleja la fila de la tabla category
export interface Category {
  id: string;
  name: string;
  display_order: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

// Campos requeridos para crear una categoría
export interface CreateCategoryData {
  name: string;
  display_order: number;
}

// Campos opcionales para actualizar una categoría
export interface UpdateCategoryData {
  name?: string;
  display_order?: number;
}

export const CategoryModel = {
  // Obtiene todas las categorías activas ordenadas por display_order
  async findAll(): Promise<Category[]> {
    const [rows] = await pool.query(
      'SELECT * FROM category WHERE is_active = 1 ORDER BY display_order ASC'
    );
    return rows as Category[];
  },

  // Obtiene una categoría por su id (activa o no)
  async findById(id: string): Promise<Category | null> {
    const [rows] = await pool.query(
      'SELECT * FROM category WHERE id = ?',
      [id]
    );
    const results = rows as Category[];
    return results[0] ?? null;
  },

  // Verifica si existe una categoría con el nombre dado (para unicidad)
  async findByName(name: string): Promise<Category | null> {
    const [rows] = await pool.query(
      'SELECT * FROM category WHERE name = ?',
      [name]
    );
    const results = rows as Category[];
    return results[0] ?? null;
  },

  // Inserta una nueva categoría y devuelve su id generado
  async create(data: CreateCategoryData): Promise<string> {
    const id = generateId();
    await pool.query(
      'INSERT INTO category (id, name, display_order) VALUES (?, ?, ?)',
      [id, data.name, data.display_order]
    );
    return id;
  },

  // Actualiza los campos proporcionados de una categoría existente
  async update(id: string, data: UpdateCategoryData): Promise<void> {
    const fields: string[] = [];
    const values: unknown[] = [];

    if (data.name !== undefined) {
      fields.push('name = ?');
      values.push(data.name);
    }
    if (data.display_order !== undefined) {
      fields.push('display_order = ?');
      values.push(data.display_order);
    }

    if (fields.length === 0) return;

    values.push(id);
    await pool.query(
      `UPDATE category SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
  },

  // Borrado suave: marca la categoría como inactiva
  async softDelete(id: string): Promise<void> {
    await pool.query(
      'UPDATE category SET is_active = 0 WHERE id = ?',
      [id]
    );
  },
};
