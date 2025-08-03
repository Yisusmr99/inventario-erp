const express = require('express');
const cors = require('cors');
const app = express();

// Importar rutas aquí cuando estén disponibles
const testRoutes = require('./routes/testRoutes');
const productCategoryRoutes = require('./routes/productCategoryRoutes');

// CORS configuration
const corsOptions = {
    origin: [
        'http://localhost:5173', // Default Vite port
        'http://localhost:5174', // Alternative Vite port
        'https://inventario-erp-production.up.railway.app',
        'https://api-inventario.up.railway.app' // Add your API domain if needed
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-requested-with'],
    credentials: true
};

// Apply CORS middleware
app.use(cors(corsOptions));

app.use(express.json());

// Middleware global de errores (si se desea implementar)
// app.use((err, req, res, next) => { ... });
app.use('/api/test', testRoutes);
app.use('/api/product-categories', productCategoryRoutes);

module.exports = app;