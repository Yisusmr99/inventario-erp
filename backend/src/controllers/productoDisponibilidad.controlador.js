const Servicio = require('../services/productoDisponibilidad.servicio');
const { ListarDisponiblesSimpleDto } = require('../dtos/productos.disponibles.dto');

exports.getDisponibles = async (req, res) => {
  try {
    // VALIDACIÓN simple (pagina, limite, con_stock, orden)
    const parametros = ListarDisponiblesSimpleDto.validate(req.query);

    const resultado = await Servicio.listarDisponiblesSimple(parametros);

    // Respuesta compacta y clara
    res.json({
      success: true,
      status: 200,
      message: 'OK',
      data: {
        paginacion: {
          total: resultado.total,
          pagina: resultado.pagina,
          total_paginas: resultado.totalPaginas,
          tiene_siguiente: resultado.tieneSiguiente,
          tiene_anterior: resultado.tieneAnterior
        },
        productos: resultado.productos  // [{ id_producto, nombre, stock_total }]
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      status: 400,
      message: error.message,
      data: null
    });
  }
};
