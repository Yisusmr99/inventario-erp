const express = require('express');
const cors = require('cors');

const app = express();

// Importamos las rutas
const productRoutes = require('./routes/productRoutes');
const productCategoryRoutes = require('./routes/productCategoryRoutes');
const testRoutes = require('./routes/testRoutes');

// Opciones de CORS
const corsOptions = {
    origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        'https://inventario-erp.up.railway.app',
        'https://api-inventario.up.railway.app'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-requested-with'],
    credentials: true
};

// Middlewares
app.use(cors(corsOptions));
app.use(express.json()); // Middleware para parsear el cuerpo de las peticiones JSON
app.use(express.urlencoded({ extended: true })); // Middleware para parsear URL-encoded

// Uso de Rutas
app.use('/api/products', productRoutes);
app.use('/api/product-categories', productCategoryRoutes);
app.use('/api/test', testRoutes);

// Exportamos la app para que pueda ser importada por server.js
module.exports = app;