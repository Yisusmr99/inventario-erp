// src/controllers/reportesInventario.controlador.js
const ReportesInventarioServicio = require('../services/reportesInventario.servicio');

/* --------------------------- NIVELES --------------------------- */
// Mantiene objeto con paginación dentro de data
async function niveles(req, res) {
  try {
    const respuesta = await ReportesInventarioServicio.obtenerNiveles({
      pagina: req.query.pagina ?? 1,
      limite: req.query.limite ?? 10,
      id_categoria: req.query.id_categoria ?? null,
      id_ubicacion: req.query.id_ubicacion ?? null,
      solo_con_stock: ['1', 'true', 'si', 'sí'].includes(
        String(req.query.solo_con_stock || '').toLowerCase()
      ),
      orden: req.query.orden || 'valor_desc',
    });

    return res.status(200).json({
      success: true,
      status: 200,
      message: 'OK',
      data: respuesta, // { paginacion, productos }
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      status: 400,
      message: error.message || 'Error al obtener niveles',
      data: null,
    });
  }
}

/* ------------------------ TOP MOVIMIENTOS (NO TOCAR) ----------------------- */
// Devuelve array en data (como ya lo tenías)
async function topMovers(req, res) {
  try {
    const datos = await ReportesInventarioServicio.obtenerTopMovimientos({
      desde: req.query.desde,
      hasta: req.query.hasta,
      tipo: req.query.tipo || 'neto',
      limite: req.query.limite ?? 10,
    });

    return res.status(200).json({
      success: true,
      status: 200,
      message: 'OK',
      data: datos, // array
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      status: 400,
      message: error.message || 'Error al obtener top-movers',
      data: null,
    });
  }
}

/* --------------------------- SLOW MOVERS ------------------------- */
// Devuelve array en data (sin paginación, excluye top rápidos)
async function slowMovers(req, res) {
  try {
    const conStock = ['1', 'true', 'si', 'sí'].includes(
      String(req.query.con_stock || '').toLowerCase()
    );
    const excluirTop = Number(req.query.excluir_top ?? req.query.limite ?? 10) || 10;

    const items = await ReportesInventarioServicio.obtenerProductosLentos({
      conStock,
      excluirTop,
    });

    return res.status(200).json({
      success: true,
      status: 200,
      message: 'OK',
      data: items, // array
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      status: 400,
      message: error.message || 'Error al obtener slow-movers',
      data: null,
    });
  }
}

/* --------------------------- FAST MOVERS ------------------------- */
// Devuelve array en data (top N por ventas acumuladas)
async function fastMovers(req, res) {
  try {
    const limite = Number(req.query.limite ?? 10) || 10;
    const conStock = ['1', 'true', 'si', 'sí'].includes(
      String(req.query.con_stock || '').toLowerCase()
    );

    const items = await ReportesInventarioServicio.obtenerProductosRapidos({
      limite,
      conStock,
    });

    return res.status(200).json({
      success: true,
      status: 200,
      message: 'OK',
      data: items, // array
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      status: 400,
      message: error.message || 'Error al obtener fast-movers',
      data: null,
    });
  }
}

module.exports = { niveles, topMovers, slowMovers, fastMovers };
