const Order = require('../models/order.model');
const { mapRequestToOrder, mapRequestItemsToOrderItems } = require('../utils/mapper');

function calculateRequestItemsTotal(items) {
  return items.reduce((sum, item) => sum + item.valorItem * item.quantidadeItem, 0);
}

function calculateMappedItemsTotal(items) {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function ensureCreateTotalConsistency(payload) {
  const itemsTotal = calculateRequestItemsTotal(payload.items);

  if (itemsTotal !== payload.valorTotal) {
    const error = new Error('valorTotal does not match items total');
    error.statusCode = 422;
    throw error;
  }
}

function ensureUpdateTotalConsistency(value, items) {
  const itemsTotal = calculateMappedItemsTotal(items);

  if (itemsTotal !== value) {
    const error = new Error('valorTotal does not match items total');
    error.statusCode = 422;
    throw error;
  }
}

async function createOrder(payload) {
  ensureCreateTotalConsistency(payload);
  const mappedOrder = mapRequestToOrder(payload);
  return Order.create(mappedOrder);
}

async function getOrderById(orderId) {
  return Order.findOne({ orderId });
}

async function listOrders() {
  return Order.find({}).sort({ creationDate: 1 });
}

async function updateOrder(orderId, payload) {
  const order = await Order.findOne({ orderId });
  if (!order) {
    return null;
  }

  const nextItems = payload.items !== undefined
    ? mapRequestItemsToOrderItems(payload.items)
    : order.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
      }));

  const nextValue = payload.valorTotal !== undefined ? payload.valorTotal : order.value;

  if (payload.items !== undefined || payload.valorTotal !== undefined) {
    ensureUpdateTotalConsistency(nextValue, nextItems);
  }

  if (payload.valorTotal !== undefined) {
    order.value = payload.valorTotal;
  }

  if (payload.dataCriacao !== undefined) {
    order.creationDate = payload.dataCriacao;
  }

  if (payload.items !== undefined) {
    order.items = nextItems;
  }

  await order.save();
  return order;
}

module.exports = {
  createOrder,
  getOrderById,
  listOrders,
  updateOrder,
};
