const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const app = require('../src/app');
const Order = require('../src/models/order.model');

let mongoServer;

async function expectCreated(payload) {
  const response = await request(app).post('/order').send(payload);

  expect(response.status).toBe(201);

  const savedOrder = await Order.findOne({ orderId: payload.numeroPedido }).lean();
  expect(savedOrder).toBeTruthy();
}

async function expectUnprocessable(payload) {
  const response = await request(app).post('/order').send(payload);

  expect(response.status).toBe(422);
  expect(response.body.message).toBe('valorTotal does not match items total');

  const totalOrders = await Order.countDocuments();
  expect(totalOrders).toBe(0);
}

describe('POST /order - total consistency integration', () => {
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

  it('accepts order with 1 item when total is consistent', async () => {
    const payload = {
      numeroPedido: 'v10089015vdb-31',
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

    await expectCreated(payload);
  });

  it('rejects order with 1 item when total is inconsistent', async () => {
    const payload = {
      numeroPedido: 'v10089015vdb-32',
      valorTotal: 10000,
      dataCriacao: '2023-07-19T12:24:11.5299601+00:00',
      items: [
        {
          idItem: '2434',
          quantidadeItem: 1,
          valorItem: 1000,
        },
      ],
    };

    await expectUnprocessable(payload);
  });

  it('accepts order with multiple items when total is consistent', async () => {
    const payload = {
      numeroPedido: 'v10089015vdb-33',
      valorTotal: 3000,
      dataCriacao: '2023-07-20T10:00:00.0000000+00:00',
      items: [
        {
          idItem: '1001',
          quantidadeItem: 2,
          valorItem: 500,
        },
        {
          idItem: '2002',
          quantidadeItem: 1,
          valorItem: 2000,
        },
      ],
    };

    await expectCreated(payload);
  });

  it('rejects order with multiple items when total is inconsistent', async () => {
    const payload = {
      numeroPedido: 'v10089015vdb-34',
      valorTotal: 5000,
      dataCriacao: '2023-07-20T10:00:00.0000000+00:00',
      items: [
        {
          idItem: '1001',
          quantidadeItem: 2,
          valorItem: 500,
        },
        {
          idItem: '2002',
          quantidadeItem: 1,
          valorItem: 2000,
        },
      ],
    };

    await expectUnprocessable(payload);
  });
});
