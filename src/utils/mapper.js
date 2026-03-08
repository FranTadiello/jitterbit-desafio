function mapRequestToOrder(payload) {
  return {
    orderId: payload.numeroPedido,
    value: payload.valorTotal,
    creationDate: payload.dataCriacao,
    items: mapRequestItemsToOrderItems(payload.items || []),
  };
}

function mapRequestItemsToOrderItems(items) {
  return items.map((item) => ({
    productId: Number(item.idItem),
    quantity: item.quantidadeItem,
    price: item.valorItem,
  }));
}

module.exports = {
  mapRequestToOrder,
  mapRequestItemsToOrderItems,
};
