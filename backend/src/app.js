const express = require('express');
const app = express();

// Importar rutas aquí cuando estén disponibles
const testRoutes = require('./routes/testRoutes');

app.use(express.json());

// Middleware global de errores (si se desea implementar)
// app.use((err, req, res, next) => { ... });
app.use('/api/test', testRoutes); 

module.exports = app;