const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const orderRoutes = require('./routes/order.routes');
const { notFoundHandler, errorHandler } = require('./middlewares/error.middleware');

const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/order', orderRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
