function validateOrderPayload(payload) {
  const errors = [];

  if (!payload || typeof payload !== 'object') {
    return ['Body must be a valid JSON object'];
  }

  if (!payload.numeroPedido) errors.push('numeroPedido is required');
  if (typeof payload.valorTotal !== 'number') errors.push('valorTotal must be a number');
  if (!payload.dataCriacao) errors.push('dataCriacao is required');
  if (!Array.isArray(payload.items)) errors.push('items must be an array');

  return errors;
}

module.exports = {
  validateOrderPayload,
};
