# Jitterbit Desafio - Orders API

API REST em Node.js para gerenciamento de pedidos, com persistencia no MongoDB e documentacao Swagger.

## Tecnologias
- Node.js
- Express
- MongoDB + Mongoose
- Jest + Supertest (testes de integracao)
- Swagger (swagger-ui-express + swagger-jsdoc)

## Requisitos
- Node.js 18+
- MongoDB em execucao local (porta 27017)

## Configuracao
1. Clone o repositorio e entre na pasta:
```bash
git clone https://github.com/FranTadiello/jitterbit-desafio 
cd jitterbit-desafio
```

2. Instale as dependencias:
```bash
npm install
```

3. Crie o arquivo `.env`:
```env
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/ordersdb
```

## Como rodar
### Desenvolvimento
```bash
npm run dev
```

### Producao
```bash
npm start
```

API base: `http://localhost:3000`

## Swagger
Com a API rodando, acesse:
- UI: `http://localhost:3000/api-docs`
- JSON: `http://localhost:3000/api-docs.json`

## Scripts
- `npm run dev` -> sobe API com nodemon
- `npm start` -> sobe API com node
- `npm test` -> roda testes

## Endpoints
### Criar pedido
- `POST /order`

Body de entrada:
```json
{
  "numeroPedido": "v10089015vdb-01",
  "valorTotal": 1000,
  "dataCriacao": "2023-07-19T12:24:11.5299601+00:00",
  "items": [
    {
      "idItem": "2434",
      "quantidadeItem": 1,
      "valorItem": 1000
    }
  ]
}
```

### Buscar pedido por ID
- `GET /order/:orderId`

### Listar pedidos
- `GET /order/list`

### Atualizar pedido
- `PUT /order/:orderId`

### Deletar pedido
- `DELETE /order/:orderId`

## Mapeamento de campos
Entrada -> Persistencia:
- `numeroPedido` -> `orderId`
- `valorTotal` -> `value`
- `dataCriacao` -> `creationDate`
- `items[].idItem` -> `items[].productId`
- `items[].quantidadeItem` -> `items[].quantity`
- `items[].valorItem` -> `items[].price`

## Regras de validacao implementadas
- Campos obrigatorios no `POST`
- Validacao de tipos e limites
- `orderId` duplicado retorna `409`
- Consistencia de total (`valorTotal` vs soma dos itens) retorna `422` quando invalida
- `DELETE` retorna `204` quando sucesso e `404` quando nao encontrado

## Como testar
Rode a suite completa:
```bash
npm test
```

## Troubleshooting
### Erro: `MONGODB_URI is not defined`
Verifique se o arquivo `.env` existe na raiz e tem `MONGODB_URI`.

### Erro de conexao Mongo (`ECONNREFUSED`)
Verifique se o MongoDB esta em execucao na porta 27017.

No PowerShell:
```powershell
Test-NetConnection 127.0.0.1 -Port 27017
```
