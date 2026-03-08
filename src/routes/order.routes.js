const express = require('express');
const orderController = require('../controllers/order.controller');

const router = express.Router();

router.post('/', orderController.createOrder);
router.get('/list', orderController.listOrders);
router.get('/:orderId', orderController.getOrderById);
router.put('/:orderId', orderController.updateOrder);
router.delete('/:orderId', orderController.deleteOrder);

module.exports = router;
