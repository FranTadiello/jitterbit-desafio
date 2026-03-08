const Order = require('../models/order.model');
const { mapRequestToOrder } = require('../utils/mapper');

async function createOrder(payload) {
  const mappedOrder = mapRequestToOrder(payload);
  return Order.create(mappedOrder);
}

module.exports = {
  createOrder,
};
