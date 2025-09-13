// src/routes/inventario.rutas.js
const express = require('express');
const controladorInventario = require('../controllers/inventario.controlador');

const rutasInventario = express.Router();

// Desglose por producto (by-group)
rutasInventario.get('/by-product/:idProducto', controladorInventario.obtenerPorProducto);

// Obtener todos los productos con inventario
rutasInventario.get('/all-products-inventory', controladorInventario.obtenerTodosProductosConInventario);

// Ajuste de cantidad (+/-)
rutasInventario.post('/adjust', controladorInventario.ajustarCantidad);

// Crear inventario (fila nueva)
rutasInventario.post('/create-inventory', controladorInventario.crearInventario);

// Editar inventario (stock_minimo, stock_maximo, id_ubicacion) — NO cantidad
rutasInventario.patch('/edit-inventory', controladorInventario.editarInventario);

// Transferencia entre ubicaciones
rutasInventario.post('/transfer', controladorInventario.transferir);

module.exports = rutasInventario;
