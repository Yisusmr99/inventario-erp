// backend/src/app.js
const express = require('express')
const cors = require('cors')
const app = express()

const testRoutes = require('./routes/testRoutes')
const productCategoryRoutes = require('./routes/productCategoryRoutes')
const productRoutes = require('./routes/productRoutes') // <= AÑADIDO

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
} // <= ¡Quité la x!

app.use(cors(corsOptions))
app.use(express.json())

app.use('/api/test', testRoutes)
app.use('/api/product-categories', productCategoryRoutes)
app.use('/api/products', productRoutes) // <= AÑADIDO

module.exports = app
