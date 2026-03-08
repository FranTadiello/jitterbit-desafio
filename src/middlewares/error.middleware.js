function notFoundHandler(_req, res) {
  return res.status(404).json({ message: 'Route not found' });
}

function errorHandler(error, _req, res, _next) {
  if (error && error.code === 11000) {
    return res.status(409).json({ message: 'orderId already exists' });
  }

  const status = error.statusCode || 500;
  const message = error.message || 'Internal server error';

  return res.status(status).json({ message });
}

module.exports = {
  notFoundHandler,
  errorHandler,
};
