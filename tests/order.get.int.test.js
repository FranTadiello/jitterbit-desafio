const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const app = require('../src/app');
const Order = require('../src/models/order.model');

let mongoServer;

async function seedOrder(orderId = 'v10089015vdb-01') {
  return Order.create({
    orderId,
    value: 1000,
    creationDate: new Date('2023-07-19T12:24:11.529Z'),
    items: [
      {
        productId: 2434,
        quantity: 1,
        price: 1000,
      },
    ],
  });
}

describe('GET /order/:orderId - integration', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  });

  afterEach(async () => {
    await Order.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it('returns the same persisted values from database', async () => {
    const savedOrder = await seedOrder('v10089015vdb-99');

    const response = await request(app).get('/order/v10089015vdb-99');

    expect(response.status).toBe(200);
    expect(response.body.orderId).toBe(savedOrder.orderId);
    expect(response.body.value).toBe(savedOrder.value);
    expect(new Date(response.body.creationDate).toISOString()).toBe(savedOrder.creationDate.toISOString());
    expect(response.body.items).toHaveLength(savedOrder.items.length);

    savedOrder.items.forEach((item, index) => {
      expect(response.body.items[index]).toMatchObject({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
      });
    });
  });

  it('returns 404 for non-existing orderId with clear message', async () => {
    const response = await request(app).get('/order/v99999999vdb-00');

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('order not found');
  });

  it('returns 400 for empty id', async () => {
    const response = await request(app).get('/order/');

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/orderId.*required/i);
  });

  it('returns 400 for malformed id', async () => {
    const response = await request(app).get('/order/@@@');

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('invalid orderId format');
  });

  it('returns 404 when id differs only by letter case', async () => {
    await seedOrder('v10089015vdb-01');

    const response = await request(app).get('/order/V10089015VDB-01');

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('order not found');
  });
});
