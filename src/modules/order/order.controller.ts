import { Request, Response } from 'express';
import { successResponse } from '../../utils/response.js';
import {
  getAllOrders,
  getOrderById,
  createOrder,
  updateStatus,
  updateShippingCost,
} from './order.service.js';

// GET /orders — admin ve todas las órdenes, cliente solo las suyas
export const listOrders = async (req: Request, res: Response) => {
  const { id, role } = req.user!;
  const orders = await getAllOrders(id, role);
  successResponse(res, orders, 'Órdenes obtenidas correctamente');
};

// GET /orders/:id — obtiene una orden con sus ítems (verifica que pertenezca al cliente)
export const getOrder = async (req: Request, res: Response) => {
  const { id, role } = req.user!;
  const order = await getOrderById(req.params.id as string, id, role);
  successResponse(res, order, 'Orden obtenida correctamente');
};

// POST /orders — crea una orden con sus ítems
export const createOrderHandler = async (req: Request, res: Response) => {
  const { id, role } = req.user!;
  const order = await createOrder({ ...req.body, auth_id: id, role });
  successResponse(res, order, 'Orden creada correctamente', 201);
};

// PUT /orders/:id/status — actualiza el estado de la orden
export const updateOrderStatusHandler = async (req: Request, res: Response) => {
  const order = await updateStatus(req.params.id as string, req.body.status);
  successResponse(res, order, 'Estado de la orden actualizado correctamente');
};

// PUT /orders/:id/shipping — actualiza el costo de envío de la orden
export const updateOrderShippingCostHandler = async (req: Request, res: Response) => {
  const order = await updateShippingCost(req.params.id as string, req.body.shipping_cost);
  successResponse(res, order, 'Costo de envío actualizado correctamente');
};
