import { pool } from '../../config/db.js';
import { generateId } from '../../utils/uuid.js';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

// Tipo de estado del pedido
export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

// Tipo que representa una orden
export interface ShopOrder extends RowDataPacket {
  id: string;
  customer_id: string;
  payment_method_id: string;
  status: OrderStatus;
  subtotal: number;
  shipping_cost: number;
  total: number;
  notes: string | null;
  created_at: string;
}

// Tipo que representa un ítem de orden
export interface OrderItem extends RowDataPacket {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  line_total: number;
}

// Tipo de producto básico para consulta de precio
export interface ProductPrice extends RowDataPacket {
  id: string;
  price: number;
  sale_price: number | null;
  stock: number;
  is_active: boolean;
  name: string;
}

// Tipo para crear un ítem de orden
export interface CreateOrderItemInput {
  product_id: string;
  quantity: number;
  unit_price: number;
  line_total: number;
}

// Tipo para crear una orden
export interface CreateOrderInput {
  customer_id: string;
  payment_method_id: string;
  subtotal: number;
  shipping_cost: number;
  total: number;
  notes?: string;
}

// Obtiene todas las órdenes (solo admin)
export const findAllOrders = async (): Promise<ShopOrder[]> => {
  const [rows] = await pool.query<ShopOrder[]>(
    `SELECT id, customer_id, payment_method_id, status,
            subtotal, shipping_cost, total, notes, created_at
     FROM shop_order
     ORDER BY id DESC`
  );
  return rows;
};

// Obtiene órdenes filtradas por customer_id (para el cliente autenticado)
export const findOrdersByCustomerId = async (customer_id: string): Promise<ShopOrder[]> => {
  const [rows] = await pool.query<ShopOrder[]>(
    `SELECT id, customer_id, payment_method_id, status,
            subtotal, shipping_cost, total, notes, created_at
     FROM shop_order
     WHERE customer_id = ?
     ORDER BY id DESC`,
    [customer_id]
  );
  return rows;
};

// Obtiene una orden por ID junto con sus ítems (soporta conexión transaccional)
export const findOrderById = async (id: string, connection?: any): Promise<ShopOrder | null> => {
  const db = (connection || pool) as typeof pool;
  const [orders] = await db.query<ShopOrder[]>(
    `SELECT id, customer_id, payment_method_id, status,
            subtotal, shipping_cost, total, notes, created_at
     FROM shop_order
     WHERE id = ?`,
    [id]
  );

  if (!orders[0]) return null;

  const [items] = await db.query<OrderItem[]>(
    `SELECT id, order_id, product_id, quantity, unit_price, line_total
     FROM order_item
     WHERE order_id = ?`,
    [id]
  );

  // Combina la orden con sus ítems en un único objeto
  return { ...orders[0], items } as ShopOrder & { items: OrderItem[] };
};

// Obtiene precio del producto verificando que esté activo (soporta conexión transaccional y bloqueo)
export const findProductPriceById = async (
  product_id: string,
  connection?: any,
  lock: boolean = false
): Promise<ProductPrice | null> => {
  const db = (connection || pool) as typeof pool;
  const lock_clause = lock ? ' FOR UPDATE' : '';
  const [rows] = await db.query<ProductPrice[]>(
    `SELECT id, price, sale_price, stock, is_active, name
     FROM product
     WHERE id = ?${lock_clause}`,
    [product_id]
  );
  return rows[0] ?? null;
};

// Inserta una nueva orden y retorna su ID (soporta conexión transaccional)
export const insertOrder = async (input: CreateOrderInput, connection?: any): Promise<string> => {
  const id = generateId();
  const db = (connection || pool) as typeof pool;
  await db.query<ResultSetHeader>(
    `INSERT INTO shop_order
       (id, customer_id, payment_method_id, status, subtotal, shipping_cost, total, notes)
     VALUES (?, ?, ?, 'pending', ?, ?, ?, ?)`,
    [
      id,
      input.customer_id,
      input.payment_method_id,
      input.subtotal,
      input.shipping_cost,
      input.total,
      input.notes ?? null,
    ]
  );
  return id;
};

// Inserta múltiples ítems para una orden (soporta conexión transaccional)
export const insertOrderItems = async (
  order_id: string,
  items: CreateOrderItemInput[],
  connection?: any
): Promise<void> => {
  const rows = items.map((item) => [
    generateId(),
    order_id,
    item.product_id,
    item.quantity,
    item.unit_price,
    item.line_total,
  ]);
  const db = (connection || pool) as typeof pool;
  await db.query(
    `INSERT INTO order_item
       (id, order_id, product_id, quantity, unit_price, line_total)
     VALUES ?`,
    [rows]
  );
};

// Actualiza únicamente el estado de una orden (soporta conexión transaccional)
export const updateOrderStatus = async (
  id: string,
  status: OrderStatus,
  connection?: any
): Promise<boolean> => {
  const db = (connection || pool) as typeof pool;
  const [result] = await db.query<ResultSetHeader>(
    `UPDATE shop_order SET status = ? WHERE id = ?`,
    [status, id]
  );
  return result.affectedRows > 0;
};

// Actualiza el costo de envío y el total de una orden (soporta conexión transaccional)
export const updateOrderShippingCost = async (
  id: string,
  shipping_cost: number,
  connection?: any
): Promise<boolean> => {
  const db = (connection || pool) as typeof pool;
  const [result] = await db.query<ResultSetHeader>(
    `UPDATE shop_order SET shipping_cost = ?, total = subtotal + ? WHERE id = ?`,
    [shipping_cost, shipping_cost, id]
  );
  return result.affectedRows > 0;
};
