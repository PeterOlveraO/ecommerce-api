import { AppError } from '../../middlewares/error.middleware.js';
import {
  findAllOrders,
  findOrdersByCustomerId,
  findOrderById,
  findProductPriceById,
  insertOrder,
  insertOrderItems,
  updateOrderStatus,
  updateOrderShippingCost,
  type OrderStatus,
  type CreateOrderItemInput,
} from './order.model.js';
import { findCustomerByAuthId } from '../customer/customer.model.js';
import { pool } from '../../config/db.js';
import { updateProductStock } from '../product/product.model.js';

// Tipo de ítem que llega en el body de la solicitud
interface OrderItemBody {
  product_id: string;
  quantity: number;
}

// Tipo del body para crear una orden
interface CreateOrderBody {
  customer_id: string;
  payment_method_id: string;
  items: OrderItemBody[];
  shipping_cost?: number;
  notes?: string;
  auth_id?: string;
  role?: string;
}

// Retorna órdenes según el rol: admin ve todas, cliente solo las suyas
export const getAllOrders = async (auth_id: string, role: string) => {
  if (role === 'admin') return findAllOrders();

  // Obtiene el customer vinculado al auth_id
  const customer = await findCustomerByAuthId(auth_id);
  if (!customer) throw new AppError('Perfil de cliente no encontrado', 404);

  return findOrdersByCustomerId(customer.id);
};

// Retorna una orden con sus ítems; lanza 404 si no existe y verifica la pertenencia para clientes (anti-IDOR)
export const getOrderById = async (id: string, auth_id?: string, role?: string) => {
  const order = await findOrderById(id);
  if (!order) throw new AppError('Orden no encontrada', 404);

  // Si es un cliente, verifica que la orden le pertenezca
  if (role && role !== 'admin' && auth_id) {
    const customer = await findCustomerByAuthId(auth_id);
    if (!customer || order.customer_id !== customer.id) {
      throw new AppError('Acceso denegado a esta orden', 403);
    }
  }

  return order;
};

// Crea una orden: valida productos, descuenta stock e inserta todo en una transacción atómica de base de datos
export const createOrder = async (body: CreateOrderBody) => {
  let { customer_id, payment_method_id, items, shipping_cost = 0, notes, auth_id, role } = body;

  // Si es cliente, forzamos que use su propio customer_id asociado a su auth_id (anti-IDOR)
  if (role && role !== 'admin' && auth_id) {
    const customer = await findCustomerByAuthId(auth_id);
    if (!customer) {
      throw new AppError('Perfil de cliente no encontrado', 404);
    }
    customer_id = customer.id;
  }

  if (!items || items.length === 0) {
    throw new AppError('La orden debe contener al menos un artículo', 400);
  }

  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {
    const resolved_items: CreateOrderItemInput[] = [];
    let subtotal = 0;

    for (const item of items) {
      if (item.quantity < 1) {
        throw new AppError(`La cantidad debe ser mayor a 0`, 400);
      }

      // Bloquea la fila del producto (FOR UPDATE) para lectura consistente y segura de stock
      const product = await findProductPriceById(item.product_id, connection, true);

      if (!product) {
        throw new AppError(`Producto ${item.product_id} no encontrado`, 404);
      }
      if (!product.is_active) {
        throw new AppError(`El producto "${product.name}" no está disponible`, 400);
      }
      if (product.stock < item.quantity) {
        throw new AppError(
          `Stock insuficiente para "${product.name}". Disponible: ${product.stock}`,
          400
        );
      }

      // Descuenta el stock del producto usando la misma conexión transaccional
      await updateProductStock(item.product_id, -item.quantity, connection);

      // Usa sale_price si está disponible, de lo contrario usa price
      const unit_price = product.sale_price ?? product.price;
      const line_total = parseFloat((unit_price * item.quantity).toFixed(2));

      subtotal += line_total;
      resolved_items.push({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price,
        line_total,
      });
    }

    subtotal = parseFloat(subtotal.toFixed(2));
    const total = parseFloat((subtotal + shipping_cost).toFixed(2));

    // Inserta la orden principal en la transacción
    const order_id = await insertOrder({
      customer_id,
      payment_method_id,
      subtotal,
      shipping_cost,
      total,
      notes,
    }, connection);

    // Inserta los ítems de la orden en la transacción
    await insertOrderItems(order_id, resolved_items, connection);

    // Hace persistentes los cambios
    await connection.commit();
    connection.release();

    return getOrderById(order_id);
  } catch (error) {
    // Revierte cualquier cambio en caso de error
    await connection.rollback();
    connection.release();
    throw error;
  }
};

// Actualiza únicamente el estado de una orden (devuelve stock al inventario si se cancela)
export const updateStatus = async (id: string, status: OrderStatus) => {
  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {
    // Busca la orden en la transacción
    const order = await findOrderById(id, connection);
    if (!order) throw new AppError('Orden no encontrada', 404);

    // Si el estado es exactamente el mismo, no hacemos nada
    if (order.status === status) {
      await connection.commit();
      connection.release();
      return order;
    }

    // Si la orden ya está cancelada, no se puede cambiar a otro estado ni volver a cancelar
    if (order.status === 'cancelled') {
      throw new AppError('No se puede modificar el estado de una orden cancelada', 400);
    }

    // Si el nuevo estado es cancelado, devolvemos el stock al inventario
    if (status === 'cancelled') {
      const items = (order as any).items || [];
      for (const item of items) {
        await updateProductStock(item.product_id, item.quantity, connection);
      }
    }

    const updated = await updateOrderStatus(id, status, connection);
    if (!updated) throw new AppError('No se pudo actualizar el estado', 500);

    await connection.commit();
    connection.release();

    return getOrderById(id);
  } catch (error) {
    await connection.rollback();
    connection.release();
    throw error;
  }
};

export const updateShippingCost = async (id: string, shipping_cost: number) => {
  const order = await findOrderById(id);
  if (!order) throw new AppError('Orden no encontrada', 404);

  const updated = await updateOrderShippingCost(id, shipping_cost);
  if (!updated) throw new AppError('No se pudo actualizar el costo de envío', 500);

  return getOrderById(id);
};
