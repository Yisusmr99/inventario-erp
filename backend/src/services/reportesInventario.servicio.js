// src/services/reportesInventario.servicio.js
const ReportesInventarioModelo = require('../models/reportesInventario.modelo');

const ReportesInventarioServicio = {
  /* ------------------------- NIVELES ------------------------- */
  async obtenerNiveles({
    pagina = 1,
    limite = 10,
    id_categoria = null,
    id_ubicacion = null,
    solo_con_stock = false,
    orden = 'valor_desc',
  }) {
    const paginaNumero = Math.max(1, Number(pagina));
    const limiteNumero = Math.max(1, Number(limite));
    const offset = (paginaNumero - 1) * limiteNumero;

    const totalFilas = await ReportesInventarioModelo.contarNiveles({
      idCategoria: id_categoria != null ? Number(id_categoria) : null,
      idUbicacion: id_ubicacion != null ? Number(id_ubicacion) : null,
      conStock: !!solo_con_stock,
    });

    const totalPaginas = Math.max(1, Math.ceil(totalFilas / limiteNumero));
    const paginaAjustada = Math.min(paginaNumero, totalPaginas);
    const offsetAjustado = (paginaAjustada - 1) * limiteNumero;

    const filas = await ReportesInventarioModelo.listarNiveles({
      offset: offsetAjustado,
      limit: limiteNumero,
      idCategoria: id_categoria != null ? Number(id_categoria) : null,
      idUbicacion: id_ubicacion != null ? Number(id_ubicacion) : null,
      conStock: !!solo_con_stock,
      orden,
    });

    return {
      paginacion: {
        total: totalFilas,
        total_paginas: totalPaginas,
        pagina: paginaAjustada,
        tiene_siguiente: paginaAjustada < totalPaginas,
        tiene_anterior: paginaAjustada > 1,
      },
      productos: filas,
    };
  },

  /* --------------------- TOP MOVIMIENTOS (NO TOCAR) --------------------- */
  async obtenerTopMovimientos({ desde, hasta, tipo = 'neto', limite = 10 }) {
    const fechaDesde = String(desde);
    const fechaHasta = String(hasta);
    const limiteNumero = Math.max(1, Number(limite));
    const tipoNormalizado = ['ventas', 'compras', 'neto'].includes(String(tipo))
      ? String(tipo)
      : 'neto';

    return ReportesInventarioModelo.topMovimientos({
      fechaDesde,
      fechaHasta,
      limite: limiteNumero,
      tipo: tipoNormalizado,
    });
  },

  /* --------------------- SLOW / FAST MOVERS ------------------ */
  async obtenerProductosLentos({ conStock = false, excluirTop = 10 }) {
    return ReportesInventarioModelo.productosLentos({
      conStock: !!conStock,
      excluirTop: Math.max(1, Number(excluirTop) || 10),
    });
  },

  async obtenerProductosRapidos({ limite = 10, conStock = false }) {
    return ReportesInventarioModelo.productosRapidos({
      limite: Math.max(1, Number(limite) || 10),
      conStock: !!conStock,
    });
  },
};

module.exports = ReportesInventarioServicio;
