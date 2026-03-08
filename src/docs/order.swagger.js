/**
 * @openapi
 * components:
 *   schemas:
 *     CreateOrderRequest:
 *       type: object
 *       required: [numeroPedido, valorTotal, dataCriacao, items]
 *       properties:
 *         numeroPedido:
 *           type: string
 *           example: v10089015vdb-01
 *         valorTotal:
 *           type: number
 *           example: 1000
 *         dataCriacao:
 *           type: string
 *           format: date-time
 *           example: 2023-07-19T12:24:11.5299601+00:00
 *         items:
 *           type: array
 *           minItems: 1
 *           items:
 *             $ref: '#/components/schemas/CreateOrderItem'
 *     CreateOrderItem:
 *       type: object
 *       required: [idItem, quantidadeItem, valorItem]
 *       properties:
 *         idItem:
 *           type: string
 *           example: '2434'
 *         quantidadeItem:
 *           type: number
 *           example: 1
 *         valorItem:
 *           type: number
 *           example: 1000
 *     UpdateOrderRequest:
 *       type: object
 *       properties:
 *         valorTotal:
 *           type: number
 *           example: 3000
 *         dataCriacao:
 *           type: string
 *           format: date-time
 *           example: 2023-07-20T10:00:00.000Z
 *         items:
 *           type: array
 *           minItems: 1
 *           items:
 *             $ref: '#/components/schemas/CreateOrderItem'
 *     OrderResponse:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         orderId:
 *           type: string
 *           example: v10089015vdb-01
 *         value:
 *           type: number
 *           example: 1000
 *         creationDate:
 *           type: string
 *           format: date-time
 *           example: 2023-07-19T12:24:11.529Z
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/OrderItemResponse'
 *         __v:
 *           type: integer
 *     OrderItemResponse:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         productId:
 *           type: number
 *           example: 2434
 *         quantity:
 *           type: number
 *           example: 1
 *         price:
 *           type: number
 *           example: 1000
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: Validation failed
 *         errors:
 *           type: array
 *           items:
 *             type: string
 */

/**
 * @openapi
 * /order:
 *   post:
 *     tags: [Order]
 *     summary: Create a new order
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateOrderRequest'
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrderResponse'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Duplicate order
 *       422:
 *         description: Business rule violation
 */

/**
 * @openapi
 * /order/list:
 *   get:
 *     tags: [Order]
 *     summary: List all orders
 *     responses:
 *       200:
 *         description: Orders listed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/OrderResponse'
 */

/**
 * @openapi
 * /order/{orderId}:
 *   get:
 *     tags: [Order]
 *     summary: Get order by orderId
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrderResponse'
 *       400:
 *         description: Invalid orderId format
 *       404:
 *         description: Order not found
 *   put:
 *     tags: [Order]
 *     summary: Update order by orderId
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateOrderRequest'
 *     responses:
 *       200:
 *         description: Order updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrderResponse'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Order not found
 *       422:
 *         description: Business rule violation
 *   delete:
 *     tags: [Order]
 *     summary: Delete order by orderId
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Order deleted successfully
 *       400:
 *         description: Invalid orderId format
 *       404:
 *         description: Order not found
 */
