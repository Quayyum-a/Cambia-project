const express = require('express');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const { port } = require('./config/env');

const authRoutes = require('./routes/authRoutes');
const zkLoginRoutes = require('./routes/zkLoginRoutes');
const vendorRoutes = require('./routes/vendorRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const logisticsRoutes = require('./routes/logisticsRoutes');
const suiRoutes = require('./routes/suiRoutes');
const demoEscrowRoutes = require('./routes/demoEscrowRoutes');

const app = express();

app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/zklogin', zkLoginRoutes);
app.use('/api/vendor', vendorRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/logistics', logisticsRoutes);
app.use('/api/sui', suiRoutes);
app.use('/api/demo-escrow', demoEscrowRoutes);

// Health
app.get('/health', (_req, res) => res.json({ ok: true }));

// Serve frontend if built
const distDir = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  // Handle client-side routing - serve index.html for all non-API routes
  app.use((req, res, next) => {
    // Skip API routes
    if (req.path.startsWith('/api')) return next();
    // Serve the React app for all other routes
    res.sendFile(path.join(distDir, 'index.html'));
  });
} else {
  app.get('/', (_req, res) => res.send('Cambia API is running'));
}

// Error handler
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Internal Server Error' });
});

// Start server if run directly
if (require.main === module) {
  app.listen(port, () => console.log(`API listening on :${port}`));
}

module.exports = app;
