// src/routes/reports.routes.js
const { Router } = require('express');
const ReportesInventarioControlador = require('../controllers/reportesInventario.controlador');

const router = Router();

/**
 * Niveles (stock/valor actual)
 * GET /api/reports/inventory/levels
 *  - Query: pagina, limite, id_categoria, id_ubicacion, solo_con_stock (1/true), orden
 *    orden: valor_desc (default) | valor_asc | stock_desc | stock_asc | nombre_asc
 */
router.get('/inventory/levels', ReportesInventarioControlador.niveles);

/**
 * Top de movimientos (bitácora AJUSTE en rango)
 * GET /api/reports/inventory/top-movers?desde=YYYY-MM-DD&hasta=YYYY-MM-DD&tipo=ventas|compras|neto&limite=10
 */
router.get('/inventory/top-movers', ReportesInventarioControlador.topMovers);

/**
 * Slow movers (más días sin moverse primero)
 * GET /api/reports/inventory/slow-movers?limite=20&con_stock=1
 */
router.get('/inventory/slow-movers', ReportesInventarioControlador.slowMovers);

/**
 * Fast movers (movimiento más reciente primero)
 * GET /api/reports/inventory/fast-movers?limite=20&con_stock=1
 */
router.get('/inventory/fast-movers', ReportesInventarioControlador.fastMovers);

module.exports = router;
