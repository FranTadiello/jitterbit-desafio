const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const app = require('../src/app');
const Order = require('../src/models/order.model');

let mongoServer;

function expectMappedOrderShape(order) {
  expect(typeof order.orderId).toBe('string');
  expect(typeof order.value).toBe('number');
  expect(typeof order.creationDate).toBe('string');
  expect(new Date(order.creationDate).toISOString()).toBe(order.creationDate);

  expect(Array.isArray(order.items)).toBe(true);
  order.items.forEach((item) => {
    expect(typeof item.productId).toBe('number');
    expect(typeof item.quantity).toBe('number');
    expect(typeof item.price).toBe('number');

    expect(item.idItem).toBeUndefined();
    expect(item.quantidadeItem).toBeUndefined();
    expect(item.valorItem).toBeUndefined();
  });

  expect(order.numeroPedido).toBeUndefined();
  expect(order.valorTotal).toBeUndefined();
  expect(order.dataCriacao).toBeUndefined();
}

async function seedOrders() {
  await Order.create([
    {
      orderId: 'v10089015vdb-01',
      value: 1000,
      creationDate: new Date('2023-07-19T12:24:11.529Z'),
      items: [
        { productId: 2434, quantity: 1, price: 1000 },
      ],
    },
    {
      orderId: 'v10089015vdb-02',
      value: 3000,
      creationDate: new Date('2023-07-20T10:00:00.000Z'),
      items: [
        { productId: 1001, quantity: 2, price: 500 },
        { productId: 2002, quantity: 1, price: 2000 },
      ],
    },
  ]);
}

describe('GET /order/list - integration', () => {
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

  it('returns empty list when there are no orders', async () => {
    const response = await request(app).get('/order/list');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body).toHaveLength(0);
  });

  it('returns list with one order in mapped format', async () => {
    await Order.create({
      orderId: 'v10089015vdb-01',
      value: 1000,
      creationDate: new Date('2023-07-19T12:24:11.529Z'),
      items: [{ productId: 2434, quantity: 1, price: 1000 }],
    });

    const response = await request(app).get('/order/list');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body).toHaveLength(1);

    expectMappedOrderShape(response.body[0]);
    expect(response.body[0].orderId).toBe('v10089015vdb-01');
    expect(response.body[0].value).toBe(1000);
  });

  it('returns list with multiple orders and matches persisted data field-by-field', async () => {
    await seedOrders();

    const response = await request(app).get('/order/list');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body).toHaveLength(2);

    response.body.forEach((order) => {
      expectMappedOrderShape(order);
    });

    const persistedOrders = await Order.find({}).lean();

    const responseById = new Map(response.body.map((order) => [order.orderId, order]));

    persistedOrders.forEach((persistedOrder) => {
      const returned = responseById.get(persistedOrder.orderId);

      expect(returned).toBeTruthy();
      expect(returned.orderId).toBe(persistedOrder.orderId);
      expect(returned.value).toBe(persistedOrder.value);
      expect(new Date(returned.creationDate).toISOString()).toBe(
        new Date(persistedOrder.creationDate).toISOString()
      );
      expect(returned.items).toHaveLength(persistedOrder.items.length);

      persistedOrder.items.forEach((item, index) => {
        expect(returned.items[index].productId).toBe(item.productId);
        expect(returned.items[index].quantity).toBe(item.quantity);
        expect(returned.items[index].price).toBe(item.price);
      });
    });
  });
});
