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

describe('PUT /order/:orderId - integration', () => {
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

  it('updates an existing order', async () => {
    await seedOrder('v10089015vdb-01');

    const payload = {
      valorTotal: 3000,
      dataCriacao: '2023-07-20T10:00:00.000Z',
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

    const response = await request(app).put('/order/v10089015vdb-01').send(payload);

    expect(response.status).toBe(200);

    const updated = await Order.findOne({ orderId: 'v10089015vdb-01' }).lean();
    expect(updated).toBeTruthy();
    expect(updated.value).toBe(3000);
    expect(new Date(updated.creationDate).toISOString()).toBe('2023-07-20T10:00:00.000Z');
    expect(updated.items).toHaveLength(2);
    expect(updated.items[0]).toMatchObject({ productId: 1001, quantity: 2, price: 500 });
    expect(updated.items[1]).toMatchObject({ productId: 2002, quantity: 1, price: 2000 });
  });

  it('returns 404 when updating a non-existing order', async () => {
    const payload = {
      valorTotal: 1000,
      items: [
        {
          idItem: '2434',
          quantidadeItem: 1,
          valorItem: 1000,
        },
      ],
    };

    const response = await request(app).put('/order/v99999999vdb-00').send(payload);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('order not found');
  });

  it('updates with partial body', async () => {
    await seedOrder('v10089015vdb-02');

    const payload = {
      dataCriacao: '2023-07-21T10:00:00.000Z',
    };

    const response = await request(app).put('/order/v10089015vdb-02').send(payload);

    expect(response.status).toBe(200);

    const updated = await Order.findOne({ orderId: 'v10089015vdb-02' }).lean();
    expect(new Date(updated.creationDate).toISOString()).toBe('2023-07-21T10:00:00.000Z');
    expect(updated.value).toBe(1000);
    expect(updated.items).toHaveLength(1);
  });

  it('returns 400 with clear validation message for invalid payload', async () => {
    await seedOrder('v10089015vdb-03');

    const payload = {
      valorTotal: '3000',
    };

    const response = await request(app).put('/order/v10089015vdb-03').send(payload);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Validation failed');
    expect(response.body.errors).toContain('valorTotal must be a number');
  });

  it('returns 400 with clear message when trying to clear items', async () => {
    await seedOrder('v10089015vdb-04');

    const payload = {
      items: [],
    };

    const response = await request(app).put('/order/v10089015vdb-04').send(payload);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Validation failed');
    expect(response.body.errors).toContain('items must have at least 1 item');
  });

  it('returns 400 with clear message for invalid item in payload', async () => {
    await seedOrder('v10089015vdb-05');

    const payload = {
      items: [
        {
          idItem: 'ABC',
          quantidadeItem: 1,
          valorItem: 1000,
        },
      ],
    };

    const response = await request(app).put('/order/v10089015vdb-05').send(payload);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Validation failed');
    expect(response.body.errors).toContain('items[0].idItem must contain only numbers');
  });

  it('keeps total consistent when items are modified with matching valorTotal', async () => {
    await seedOrder('v10089015vdb-06');

    const payload = {
      valorTotal: 4000,
      items: [
        {
          idItem: '3003',
          quantidadeItem: 2,
          valorItem: 2000,
        },
      ],
    };

    const response = await request(app).put('/order/v10089015vdb-06').send(payload);

    expect(response.status).toBe(200);

    const updated = await Order.findOne({ orderId: 'v10089015vdb-06' }).lean();
    expect(updated.value).toBe(4000);
    expect(updated.items).toHaveLength(1);
    expect(updated.items[0]).toMatchObject({ productId: 3003, quantity: 2, price: 2000 });
  });

  it('returns 422 when items are modified and valorTotal is inconsistent', async () => {
    await seedOrder('v10089015vdb-07');

    const payload = {
      valorTotal: 9999,
      items: [
        {
          idItem: '4004',
          quantidadeItem: 1,
          valorItem: 1000,
        },
      ],
    };

    const response = await request(app).put('/order/v10089015vdb-07').send(payload);

    expect(response.status).toBe(422);
    expect(response.body.message).toBe('valorTotal does not match items total');
  });
});
