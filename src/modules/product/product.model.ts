import { pool } from '../../config/db.js';
import { generateId } from '../../utils/uuid.js';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

// Tipo que representa un producto con sus categorías
export interface Product extends RowDataPacket {
  id: string;
  name: string;
  brand: string;
  description: string | null;
  price: number;
  sale_price: number | null;
  stock: number;
  details: unknown;
  image_url: string;
  display_order: number;
  is_active: boolean;
}

// Tipo para crear un producto nuevo
export interface CreateProductInput {
  name: string;
  brand: string;
  description?: string;
  price: number;
  sale_price?: number;
  stock?: number;
  details?: unknown;
  image_url: string;
  display_order: number;
  category_ids?: string[];
}

// Tipo para actualizar un producto (todos los campos opcionales)
export interface UpdateProductInput {
  name?: string;
  brand?: string;
  description?: string;
  price?: number;
  sale_price?: number;
  stock?: number;
  details?: unknown;
  image_url?: string;
  display_order?: number;
  category_ids?: string[];
}

// Parámetros de paginación y filtros para el listado de productos
export interface ProductQuery {
  page:        number;
  limit:       number;
  search?:     string;  // filtra por nombre o marca
  category_id?: string; // filtra por categoría
}

// Obtiene productos activos con paginación y filtros opcionales
export const findProductsPaginated = async (
  query: ProductQuery
): Promise<Product[]> => {
  const { page, limit, search, category_id } = query;
  const offset = (page - 1) * limit;

  const conditions: string[] = ['p.is_active = 1'];
  const params: unknown[]    = [];

  // Filtro de búsqueda por nombre o marca
  if (search) {
    conditions.push('(p.name LIKE ? OR p.brand LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }

  // Filtro por categoría via JOIN
  const category_join = category_id
    ? 'INNER JOIN product_category pc ON pc.product_id = p.id AND pc.category_id = ?'
    : '';
  if (category_id) params.unshift(category_id); // va antes del LIMIT

  const where = `WHERE ${conditions.join(' AND ')}`;

  const [rows] = await pool.query<Product[]>(
    `SELECT p.id, p.name, p.brand, p.description, p.price, p.sale_price,
            p.stock, p.details, p.image_url, p.display_order, p.is_active
     FROM product p
     ${category_join}
     ${where}
     ORDER BY p.display_order ASC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );
  return rows;
};

// Cuenta el total de productos activos con los mismos filtros (para pagination.total)
export const countProducts = async (
  query: Pick<ProductQuery, 'search' | 'category_id'>
): Promise<number> => {
  const { search, category_id } = query;

  const conditions: string[] = ['p.is_active = 1'];
  const params: unknown[]    = [];

  if (search) {
    conditions.push('(p.name LIKE ? OR p.brand LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }

  const category_join = category_id
    ? 'INNER JOIN product_category pc ON pc.product_id = p.id AND pc.category_id = ?'
    : '';
  if (category_id) params.unshift(category_id);

  const where = `WHERE ${conditions.join(' AND ')}`;

  const [rows] = await pool.query<(RowDataPacket & { total: number })[]>(
    `SELECT COUNT(*) AS total
     FROM product p
     ${category_join}
     ${where}`,
    params
  );
  return rows[0].total;
};

// Obtiene un producto por ID junto con sus categorías
export const findProductById = async (id: string): Promise<Product | null> => {
  const [rows] = await pool.query<Product[]>(
    `SELECT
       p.id, p.name, p.brand, p.description, p.price, p.sale_price,
       p.stock, p.details, p.image_url, p.display_order, p.is_active,
       JSON_ARRAYAGG(
         IF(c.id IS NOT NULL, JSON_OBJECT('id', c.id, 'name', c.name), NULL)
       ) AS categories
     FROM product p
     LEFT JOIN product_category pc ON pc.product_id = p.id
     LEFT JOIN category c ON c.id = pc.category_id
     WHERE p.id = ?
     GROUP BY p.id`,
    [id]
  );
  return rows[0] ?? null;
};

// Inserta un producto nuevo y retorna su ID
export const insertProduct = async (
  input: CreateProductInput
): Promise<string> => {
  const id = generateId();
  await pool.query<ResultSetHeader>(
    `INSERT INTO product
       (id, name, brand, description, price, sale_price, stock,
        details, image_url, display_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      input.name,
      input.brand,
      input.description ?? null,
      input.price,
      input.sale_price ?? null,
      input.stock ?? 0,
      input.details ? JSON.stringify(input.details) : null,
      input.image_url,
      input.display_order,
    ]
  );
  return id;
};

// Actualiza los campos del producto que se provean
export const updateProduct = async (
  id: string,
  input: UpdateProductInput
): Promise<boolean> => {
  // Construye la lista de columnas dinámicamente para evitar sobreescribir con undefined
  const fields: string[] = [];
  const values: unknown[] = [];

  if (input.name !== undefined) { fields.push('name = ?'); values.push(input.name); }
  if (input.brand !== undefined) { fields.push('brand = ?'); values.push(input.brand); }
  if (input.description !== undefined) { fields.push('description = ?'); values.push(input.description); }
  if (input.price !== undefined) { fields.push('price = ?'); values.push(input.price); }
  if (input.sale_price !== undefined) { fields.push('sale_price = ?'); values.push(input.sale_price); }
  if (input.stock !== undefined) { fields.push('stock = ?'); values.push(input.stock); }
  if (input.details !== undefined) { fields.push('details = ?'); values.push(JSON.stringify(input.details)); }
  if (input.image_url !== undefined) { fields.push('image_url = ?'); values.push(input.image_url); }
  if (input.display_order !== undefined) { fields.push('display_order = ?'); values.push(input.display_order); }

  if (fields.length === 0) return false;

  values.push(id);
  const [result] = await pool.query<ResultSetHeader>(
    `UPDATE product SET ${fields.join(', ')} WHERE id = ?`,
    values
  );
  return result.affectedRows > 0;
};

// Marca el producto como inactivo (soft delete)
export const softDeleteProduct = async (id: string): Promise<boolean> => {
  const [result] = await pool.query<ResultSetHeader>(
    `UPDATE product SET is_active = 0 WHERE id = ?`,
    [id]
  );
  return result.affectedRows > 0;
};

// Elimina todas las asociaciones de categorías de un producto
export const deleteProductCategories = async (product_id: string): Promise<void> => {
  await pool.query(
    `DELETE FROM product_category WHERE product_id = ?`,
    [product_id]
  );
};

// Inserta las asociaciones de categorías para un producto
export const insertProductCategories = async (
  product_id: string,
  category_ids: string[]
): Promise<void> => {
  if (category_ids.length === 0) return;
  const rows = category_ids.map((cat_id) => [product_id, cat_id]);
  await pool.query(
    `INSERT INTO product_category (product_id, category_id) VALUES ?`,
    [rows]
  );
};

// Actualiza el stock de un producto (acepta una conexión de transacción opcional)
export const updateProductStock = async (
  id: string,
  quantityChange: number,
  connection?: any
): Promise<boolean> => {
  const db = (connection || pool) as typeof pool;
  const [result] = await db.query<ResultSetHeader>(
    `UPDATE product SET stock = stock + ? WHERE id = ?`,
    [quantityChange, id]
  );
  return result.affectedRows > 0;
};

