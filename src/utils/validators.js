const MAX_TOTAL_VALUE = 1000000000;
const MAX_ITEM_PRICE = 1000000000;
const MAX_ITEM_QUANTITY = 1000000;

function isFiniteNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

function isValidDateString(value) {
  if (typeof value !== 'string') return false;
  const parsed = new Date(value);
  return !Number.isNaN(parsed.getTime());
}

function validateItems(items, errors) {
  if (!Array.isArray(items)) {
    errors.push('items must be an array');
    return;
  }

  if (items.length === 0) {
    errors.push('items must have at least 1 item');
    return;
  }

  items.forEach((item, index) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      errors.push(`items[${index}] must be a valid object`);
      return;
    }

    if (item.idItem === undefined || item.idItem === null || item.idItem === '') {
      errors.push(`items[${index}].idItem is required`);
    } else if (!/^\d+$/.test(String(item.idItem))) {
      errors.push(`items[${index}].idItem must contain only numbers`);
    }

    if (item.quantidadeItem === undefined) {
      errors.push(`items[${index}].quantidadeItem is required`);
    } else if (!isFiniteNumber(item.quantidadeItem)) {
      errors.push(`items[${index}].quantidadeItem must be a number`);
    } else if (item.quantidadeItem <= 0) {
      errors.push(`items[${index}].quantidadeItem must be greater than 0`);
    } else if (item.quantidadeItem > MAX_ITEM_QUANTITY) {
      errors.push(`items[${index}].quantidadeItem must be lower than or equal to ${MAX_ITEM_QUANTITY}`);
    }

    if (item.valorItem === undefined) {
      errors.push(`items[${index}].valorItem is required`);
    } else if (!isFiniteNumber(item.valorItem)) {
      errors.push(`items[${index}].valorItem must be a number`);
    } else if (item.valorItem <= 0) {
      errors.push(`items[${index}].valorItem must be greater than 0`);
    } else if (item.valorItem > MAX_ITEM_PRICE) {
      errors.push(`items[${index}].valorItem must be lower than or equal to ${MAX_ITEM_PRICE}`);
    }
  });
}

function validateOrderPayload(payload) {
  const errors = [];

  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return ['Body must be a valid JSON object'];
  }

  if (!payload.numeroPedido) {
    errors.push('numeroPedido is required');
  }

  if (payload.valorTotal === undefined) {
    errors.push('valorTotal is required');
  } else if (!isFiniteNumber(payload.valorTotal)) {
    errors.push('valorTotal must be a number');
  } else if (payload.valorTotal <= 0) {
    errors.push('valorTotal must be greater than 0');
  } else if (payload.valorTotal > MAX_TOTAL_VALUE) {
    errors.push(`valorTotal must be lower than or equal to ${MAX_TOTAL_VALUE}`);
  }

  if (payload.dataCriacao === undefined) {
    errors.push('dataCriacao is required');
  } else if (!isValidDateString(payload.dataCriacao)) {
    errors.push('dataCriacao must be a valid date string');
  }

  if (payload.items === undefined) {
    errors.push('items is required');
  } else {
    validateItems(payload.items, errors);
  }

  return errors;
}

function validateOrderUpdatePayload(payload) {
  const errors = [];

  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return ['Body must be a valid JSON object'];
  }

  if (Object.keys(payload).length === 0) {
    return ['At least one field must be provided'];
  }

  if (payload.valorTotal !== undefined) {
    if (!isFiniteNumber(payload.valorTotal)) {
      errors.push('valorTotal must be a number');
    } else if (payload.valorTotal <= 0) {
      errors.push('valorTotal must be greater than 0');
    } else if (payload.valorTotal > MAX_TOTAL_VALUE) {
      errors.push(`valorTotal must be lower than or equal to ${MAX_TOTAL_VALUE}`);
    }
  }

  if (payload.dataCriacao !== undefined && !isValidDateString(payload.dataCriacao)) {
    errors.push('dataCriacao must be a valid date string');
  }

  if (payload.items !== undefined) {
    validateItems(payload.items, errors);
  }

  return errors;
}

module.exports = {
  validateOrderPayload,
  validateOrderUpdatePayload,
};
