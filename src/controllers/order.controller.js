const orderService = require('../services/order.service');
const { validateOrderPayload, validateOrderUpdatePayload } = require('../utils/validators');

function isValidOrderIdFormat(orderId) {
  return /^[A-Za-z0-9-]+$/.test(orderId);
}

async function createOrder(req, res, next) {
  try {
    const errors = validateOrderPayload(req.body);
    if (errors.length) {
      return res.status(400).json({ message: 'Validation failed', errors });
    }

    const order = await orderService.createOrder(req.body);
    return res.status(201).json(order);
  } catch (error) {
    return next(error);
  }
}

async function getOrderById(req, res, next) {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({ message: 'orderId is required' });
    }

    if (!isValidOrderIdFormat(orderId)) {
      return res.status(400).json({ message: 'invalid orderId format' });
    }

    const order = await orderService.getOrderById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'order not found' });
    }

    return res.status(200).json(order);
  } catch (error) {
    return next(error);
  }
}

async function listOrders(_req, res, next) {
  try {
    const orders = await orderService.listOrders();
    return res.status(200).json(orders);
  } catch (error) {
    return next(error);
  }
}

async function updateOrder(req, res, next) {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({ message: 'orderId is required' });
    }

    if (!isValidOrderIdFormat(orderId)) {
      return res.status(400).json({ message: 'invalid orderId format' });
    }

    const errors = validateOrderUpdatePayload(req.body);
    if (errors.length) {
      return res.status(400).json({ message: 'Validation failed', errors });
    }

    const updatedOrder = await orderService.updateOrder(orderId, req.body);
    if (!updatedOrder) {
      return res.status(404).json({ message: 'order not found' });
    }

    return res.status(200).json(updatedOrder);
  } catch (error) {
    return next(error);
  }
}

async function deleteOrder(req, res, next) {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({ message: 'orderId is required' });
    }

    if (!isValidOrderIdFormat(orderId)) {
      return res.status(400).json({ message: 'invalid orderId format' });
    }

    const deleted = await orderService.deleteOrder(orderId);
    if (!deleted) {
      return res.status(404).json({ message: 'order not found' });
    }

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createOrder,
  getOrderById,
  listOrders,
  updateOrder,
  deleteOrder,
};
