const express = require('express');
const controlador = require('../controllers/productoDisponibilidad.controlador');

const rutasComercio = express.Router();

// El available para devolver solo id_producto, nombre, stock_total:
rutasComercio.get('/products/available', controlador.getDisponibles);

module.exports = rutasComercio;
