const Order = require('../models/order.model');
const { mapRequestToOrder } = require('../utils/mapper');

function calculateItemsTotal(items) {
  return items.reduce((sum, item) => sum + item.valorItem * item.quantidadeItem, 0);
}

function ensureOrderTotalConsistency(payload) {
  const itemsTotal = calculateItemsTotal(payload.items);

  if (itemsTotal !== payload.valorTotal) {
    const error = new Error('valorTotal does not match items total');
    error.statusCode = 422;
    throw error;
  }
}

async function createOrder(payload) {
  ensureOrderTotalConsistency(payload);
  const mappedOrder = mapRequestToOrder(payload);
  return Order.create(mappedOrder);
}

module.exports = {
  createOrder,
};
