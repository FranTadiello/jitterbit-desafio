const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const app = require('../src/app');
const Order = require('../src/models/order.model');

let mongoServer;

describe('POST /order - create order integration', () => {
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

  it('creates order with 1 item and returns 201 Created', async () => {
    const payload = {
      numeroPedido: 'v10089015vdb-01',
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

    const response = await request(app).post('/order').send(payload);

    expect(response.status).toBe(201);
    expect(response.body.orderId).toBe(payload.numeroPedido);
    expect(response.body.value).toBe(payload.valorTotal);
    expect(new Date(response.body.creationDate).toISOString()).toBe('2023-07-19T12:24:11.529Z');
    expect(response.body.items).toHaveLength(1);
    expect(response.body.items[0].productId).toBe(2434);
    expect(response.body.items[0].quantity).toBe(1);
    expect(response.body.items[0].price).toBe(1000);

    const savedOrder = await Order.findOne({ orderId: payload.numeroPedido }).lean();
    expect(savedOrder).toBeTruthy();
    expect(savedOrder.orderId).toBe(payload.numeroPedido);
    expect(savedOrder.value).toBe(payload.valorTotal);
    expect(new Date(savedOrder.creationDate).toISOString()).toBe('2023-07-19T12:24:11.529Z');
    expect(savedOrder.items).toHaveLength(1);
    expect(savedOrder.items[0].productId).toBe(2434);
    expect(savedOrder.items[0].quantity).toBe(1);
    expect(savedOrder.items[0].price).toBe(1000);
  });

  it('creates order with multiple items and maps all fields correctly', async () => {
    const payload = {
      numeroPedido: 'v10089015vdb-02',
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

    const response = await request(app).post('/order').send(payload);

    expect(response.status).toBe(201);
    expect(response.body.orderId).toBe(payload.numeroPedido);
    expect(response.body.value).toBe(payload.valorTotal);
    expect(new Date(response.body.creationDate).toISOString()).toBe('2023-07-20T10:00:00.000Z');
    expect(response.body.items).toHaveLength(2);

    expect(response.body.items[0]).toMatchObject({
      productId: 1001,
      quantity: 2,
      price: 500,
    });

    expect(response.body.items[1]).toMatchObject({
      productId: 2002,
      quantity: 1,
      price: 2000,
    });

    const savedOrder = await Order.findOne({ orderId: payload.numeroPedido }).lean();
    expect(savedOrder).toBeTruthy();
    expect(savedOrder.orderId).toBe(payload.numeroPedido);
    expect(savedOrder.value).toBe(payload.valorTotal);
    expect(new Date(savedOrder.creationDate).toISOString()).toBe('2023-07-20T10:00:00.000Z');
    expect(savedOrder.items).toHaveLength(2);

    expect(savedOrder.items[0]).toMatchObject({
      productId: 1001,
      quantity: 2,
      price: 500,
    });

    expect(savedOrder.items[1]).toMatchObject({
      productId: 2002,
      quantity: 1,
      price: 2000,
    });
  });
});
