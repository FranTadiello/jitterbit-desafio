const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const app = require('../src/app');
const Order = require('../src/models/order.model');

let mongoServer;

async function seedOrder(orderId = 'v10089015vdb-del-01') {
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

describe('DELETE /order/:orderId - integration', () => {
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

  it('deletes an existing order and returns 204', async () => {
    await seedOrder('v10089015vdb-del-01');

    const response = await request(app).delete('/order/v10089015vdb-del-01');

    expect(response.status).toBe(204);
  });

  it('returns 404 when deleting a non-existing order', async () => {
    const response = await request(app).delete('/order/v99999999vdb-del-00');

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('order not found');
  });

  it('returns 404 when deleting the same order twice', async () => {
    await seedOrder('v10089015vdb-del-02');

    const firstDelete = await request(app).delete('/order/v10089015vdb-del-02');
    expect(firstDelete.status).toBe(204);

    const secondDelete = await request(app).delete('/order/v10089015vdb-del-02');
    expect(secondDelete.status).toBe(404);
    expect(secondDelete.body.message).toBe('order not found');
  });

  it('confirms existence before delete and confirms removal after delete', async () => {
    const orderId = 'v10089015vdb-del-03';
    await seedOrder(orderId);

    const getBeforeDelete = await request(app).get(`/order/${orderId}`);
    expect(getBeforeDelete.status).toBe(200);
    expect(getBeforeDelete.body.orderId).toBe(orderId);

    const deleteResponse = await request(app).delete(`/order/${orderId}`);
    expect(deleteResponse.status).toBe(204);

    const getAfterDelete = await request(app).get(`/order/${orderId}`);
    expect(getAfterDelete.status).toBe(404);
    expect(getAfterDelete.body.message).toBe('order not found');
  });
});
