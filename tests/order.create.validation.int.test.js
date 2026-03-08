const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const app = require('../src/app');
const Order = require('../src/models/order.model');

let mongoServer;

function buildValidPayload() {
  return {
    numeroPedido: 'v10089015vdb-99',
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
}

async function expectBadRequest(payload, expectedError) {
  const response = await request(app).post('/order').send(payload);

  expect(response.status).toBe(400);
  expect(response.body.message).toBe('Validation failed');
  expect(response.body.errors).toContain(expectedError);

  const totalOrders = await Order.countDocuments();
  expect(totalOrders).toBe(0);
}

describe('POST /order - validation integration', () => {
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

  it('returns 400 when numeroPedido is missing', async () => {
    const payload = buildValidPayload();
    delete payload.numeroPedido;

    await expectBadRequest(payload, 'numeroPedido is required');
  });

  it('returns 400 when valorTotal is missing', async () => {
    const payload = buildValidPayload();
    delete payload.valorTotal;

    await expectBadRequest(payload, 'valorTotal is required');
  });

  it('returns 400 when dataCriacao is missing', async () => {
    const payload = buildValidPayload();
    delete payload.dataCriacao;

    await expectBadRequest(payload, 'dataCriacao is required');
  });

  it('returns 400 when items is missing', async () => {
    const payload = buildValidPayload();
    delete payload.items;

    await expectBadRequest(payload, 'items is required');
  });

  it('returns 400 when item idItem is missing', async () => {
    const payload = buildValidPayload();
    delete payload.items[0].idItem;

    await expectBadRequest(payload, 'items[0].idItem is required');
  });

  it('returns 400 when item quantidadeItem is missing', async () => {
    const payload = buildValidPayload();
    delete payload.items[0].quantidadeItem;

    await expectBadRequest(payload, 'items[0].quantidadeItem is required');
  });

  it('returns 400 when item valorItem is missing', async () => {
    const payload = buildValidPayload();
    delete payload.items[0].valorItem;

    await expectBadRequest(payload, 'items[0].valorItem is required');
  });

  it('returns 400 when valorTotal is a string', async () => {
    const payload = buildValidPayload();
    payload.valorTotal = '10000';

    await expectBadRequest(payload, 'valorTotal must be a number');
  });

  it('returns 400 when quantidadeItem is a string', async () => {
    const payload = buildValidPayload();
    payload.items[0].quantidadeItem = '1';

    await expectBadRequest(payload, 'items[0].quantidadeItem must be a number');
  });

  it('returns 400 when valorItem is a string', async () => {
    const payload = buildValidPayload();
    payload.items[0].valorItem = '1000';

    await expectBadRequest(payload, 'items[0].valorItem must be a number');
  });

  it('returns 400 when items is an object instead of array', async () => {
    const payload = buildValidPayload();
    payload.items = { idItem: '2434', quantidadeItem: 1, valorItem: 1000 };

    await expectBadRequest(payload, 'items must be an array');
  });

  it('returns 400 when dataCriacao is a number', async () => {
    const payload = buildValidPayload();
    payload.dataCriacao = 123456;

    await expectBadRequest(payload, 'dataCriacao must be a valid date string');
  });

  it('returns 400 when dataCriacao is invalid text', async () => {
    const payload = buildValidPayload();
    payload.dataCriacao = 'invalid-date';

    await expectBadRequest(payload, 'dataCriacao must be a valid date string');
  });
  
  it('returns 400 when idItem contains letters', async () => {
    const payload = buildValidPayload();
    payload.items[0].idItem = 'ABC';

    await expectBadRequest(payload, 'items[0].idItem must contain only numbers');
  });

  it('returns 400 when valorTotal is 0', async () => {
    const payload = buildValidPayload();
    payload.valorTotal = 0;

    await expectBadRequest(payload, 'valorTotal must be greater than 0');
  });

  it('returns 400 when valorTotal is negative', async () => {
    const payload = buildValidPayload();
    payload.valorTotal = -1;

    await expectBadRequest(payload, 'valorTotal must be greater than 0');
  });

  it('returns 400 when quantidadeItem is 0', async () => {
    const payload = buildValidPayload();
    payload.items[0].quantidadeItem = 0;

    await expectBadRequest(payload, 'items[0].quantidadeItem must be greater than 0');
  });

  it('returns 400 when quantidadeItem is negative', async () => {
    const payload = buildValidPayload();
    payload.items[0].quantidadeItem = -2;

    await expectBadRequest(payload, 'items[0].quantidadeItem must be greater than 0');
  });

  it('returns 400 when valorItem is 0', async () => {
    const payload = buildValidPayload();
    payload.items[0].valorItem = 0;

    await expectBadRequest(payload, 'items[0].valorItem must be greater than 0');
  });

  it('returns 400 when valorItem is negative', async () => {
    const payload = buildValidPayload();
    payload.items[0].valorItem = -100;

    await expectBadRequest(payload, 'items[0].valorItem must be greater than 0');
  });

  it('returns 400 when item valorItem is too high', async () => {
    const payload = buildValidPayload();
    payload.items[0].valorItem = 1000000001;

    await expectBadRequest(payload, 'items[0].valorItem must be lower than or equal to 1000000000');
  });

  it('returns 400 when item quantidadeItem is too high', async () => {
    const payload = buildValidPayload();
    payload.items[0].quantidadeItem = 1000001;

    await expectBadRequest(payload, 'items[0].quantidadeItem must be lower than or equal to 1000000');
  });
});
