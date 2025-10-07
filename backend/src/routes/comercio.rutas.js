const express = require('express');
const controlador = require('../controllers/productoDisponibilidad.controlador');

const rutasComercio = express.Router();


rutasComercio.get('/products/available', controlador.getDisponibles);


rutasComercio.get('/products/available/all', controlador.getDisponiblesSinPaginacion);
rutasComercio.get('/products/available/with-locations', controlador.getDisponiblesConUbicaciones);

module.exports = rutasComercio;
