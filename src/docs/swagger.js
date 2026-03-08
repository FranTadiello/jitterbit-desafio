const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Jitterbit Orders API',
      version: '1.0.0',
      description: 'API para gerenciamento de pedidos.',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Local server',
      },
    ],
  },
  apis: ['./src/docs/order.swagger.js'],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = {
  swaggerSpec,
};
