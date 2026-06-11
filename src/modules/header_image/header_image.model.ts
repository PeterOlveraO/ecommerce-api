import { pool } from '../../config/db.js';
import { generateId } from '../../utils/uuid.js';

// Tipado que refleja la fila de la tabla header_image
export interface HeaderImage {
  id: string;
  name: string;
  image_url: string;
  link_url: string | null;
  display_order: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

// Campos requeridos para crear una imagen de cabecera
export interface CreateHeaderImageData {
  name: string;
  image_url: string;
  link_url?: string | null;
  display_order: number;
}

// Campos opcionales para actualizar una imagen de cabecera
export interface UpdateHeaderImageData {
  name?: string;
  image_url?: string;
  link_url?: string | null;
  display_order?: number;
}

export const HeaderImageModel = {
  // Obtiene todas las imágenes de cabecera activas ordenadas por display_order
  async findAll(): Promise<HeaderImage[]> {
    const [rows] = await pool.query(
      'SELECT * FROM header_image WHERE is_active = 1 ORDER BY display_order ASC'
    );
    return rows as HeaderImage[];
  },

  // Obtiene una imagen de cabecera por su id (activa o no)
  async findById(id: string): Promise<HeaderImage | null> {
    const [rows] = await pool.query(
      'SELECT * FROM header_image WHERE id = ?',
      [id]
    );
    const results = rows as HeaderImage[];
    return results[0] ?? null;
  },

  // Inserta una nueva imagen de cabecera y devuelve su id generado
  async create(data: CreateHeaderImageData): Promise<string> {
    const id = generateId();
    await pool.query(
      'INSERT INTO header_image (id, name, image_url, link_url, display_order) VALUES (?, ?, ?, ?, ?)',
      [id, data.name, data.image_url, data.link_url ?? null, data.display_order]
    );
    return id;
  },

  // Actualiza los campos proporcionados de una imagen de cabecera existente
  async update(id: string, data: UpdateHeaderImageData): Promise<void> {
    const fields: string[] = [];
    const values: unknown[] = [];

    if (data.name !== undefined) {
      fields.push('name = ?');
      values.push(data.name);
    }
    if (data.image_url !== undefined) {
      fields.push('image_url = ?');
      values.push(data.image_url);
    }
    if (data.link_url !== undefined) {
      fields.push('link_url = ?');
      values.push(data.link_url);
    }
    if (data.display_order !== undefined) {
      fields.push('display_order = ?');
      values.push(data.display_order);
    }

    if (fields.length === 0) return;

    values.push(id);
    await pool.query(
      `UPDATE header_image SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
  },

  // Borrado suave: marca la imagen como inactiva
  async softDelete(id: string): Promise<void> {
    await pool.query(
      'UPDATE header_image SET is_active = 0 WHERE id = ?',
      [id]
    );
  },
};
