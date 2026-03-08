const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');

const orderRoutes = require('./routes/order.routes');
const { swaggerSpec } = require('./docs/swagger');
const { notFoundHandler, errorHandler } = require('./middlewares/error.middleware');

const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api-docs.json', (_req, res) => {
  res.status(200).json(swaggerSpec);
});

app.use('/order', orderRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
