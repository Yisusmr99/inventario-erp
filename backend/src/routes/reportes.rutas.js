// src/routes/reportes.rutas.js
const express = require('express');
const ctrl = require('../controllers/reportesInventario.controlador');

const router = express.Router();

/** Niveles */
router.get('/inventory/levels', ctrl.niveles);

/** Top-movers (NO TOCAR) */
router.get('/inventory/top-movers', ctrl.topMovers);

/** Slow-movers (todos; excluye top rápidos) */
router.get('/inventory/slow-movers', ctrl.slowMovers);

/** Fast-movers (top N; default 10) */
router.get('/inventory/fast-movers', ctrl.fastMovers);

module.exports = router;
