const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const app = require('../src/app');
const Order = require('../src/models/order.model');

let mongoServer;

describe('POST /order - duplicate order integration', () => {
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

  it('returns 409 Conflict when creating the same numeroPedido twice', async () => {
    const payload = {
      numeroPedido: 'v10089015vdb-dup-01',
      valorTotal: 1000,
      dataCriacao: '2023-07-19T12:24:11.5299601+00:00',
      items: [
        {
          idItem: '2434',
          quantidadeItem: 1,
          valorItem: 1000,
        },
      ],
    };

    const firstResponse = await request(app).post('/order').send(payload);
    expect(firstResponse.status).toBe(201);

    const secondResponse = await request(app).post('/order').send(payload);
    expect(secondResponse.status).toBe(409);
    expect(secondResponse.body.message).toBe('orderId already exists');

    const totalOrders = await Order.countDocuments({ orderId: payload.numeroPedido });
    expect(totalOrders).toBe(1);
  });
});
