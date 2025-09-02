const cors = require('cors');
const express = require('express');
const routes = require('./routes');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('../swagger');
require('dotenv').config();

const userService = require('./services/userService');
const productService = require('./services/productService');
const orderService = require('./services/orderService');

// Initialize express app
const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.set('trust proxy', true);

// Swagger docs with dynamic server URL and tags
app.use('/docs', swaggerUi.serve, (req, res, next) => {
  const host = req.get('host');
  let protocol = req.protocol;
  const actualPort = req.socket.localPort;
  const hasPort = host.includes(':');

  const needsPort =
    !hasPort &&
    ((protocol === 'http' && actualPort !== 80) ||
     (protocol === 'https' && actualPort !== 443));
  const fullHost = needsPort ? `${host}:${actualPort}` : host;
  protocol = req.secure ? 'https' : protocol;

  const dynamicSpec = {
    ...swaggerSpec,
    info: {
      title: 'Online Shopping Platform API',
      version: '1.0.0',
      description: 'REST API for products, users, auth, cart, orders, and payments.',
    },
    servers: [{ url: `${protocol}://${fullHost}` }],
    tags: [
      { name: 'Health' },
      { name: 'Auth' },
      { name: 'Products' },
      { name: 'Cart' },
      { name: 'Orders' },
    ],
  };
  swaggerUi.setup(dynamicSpec)(req, res, next);
});

// Parse JSON request body
app.use(express.json());

// Mount routes
app.use('/', routes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Internal Server Error',
  });
});

// Initialize DB tables on startup (best-effort)
(async () => {
  try {
    await userService.init();
    await productService.init();
    await orderService.init();
  } catch (err) {
    console.error('Failed to initialize database tables:', err.message);
  }
})();

module.exports = app;
