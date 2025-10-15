const Servicio = require('../services/productoDisponibilidad.servicio');
const {
  ListarDisponiblesSimpleDto,
  ListarSinPaginacionDto,
  ObtenerProductoDisponibleDto
} = require('../dtos/productos.disponibles.dto');

exports.getDisponibles = async (req, res) => {
  try {
    const parametros = ListarDisponiblesSimpleDto.validate(req.query);
    const resultado = await Servicio.listarDisponiblesSimple(parametros);

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
        productos: resultado.productos // [{ id_producto, nombre, stock_total }]
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


exports.getDisponiblesSinPaginacion = async (req, res) => {
  try {
    const parametros = ListarSinPaginacionDto.validate(req.query);
    const productos = await Servicio.listarDisponiblesSinPaginacion(parametros);
    res.json({
      success: true,
      status: 200,
      message: 'OK',
      data: { productos } // [{ id_producto, nombre, stock_total }]
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


exports.getDisponiblesConUbicaciones = async (req, res) => {
  try {
    const parametros = ListarSinPaginacionDto.validate(req.query);
    const productos = await Servicio.listarDisponiblesConUbicaciones(parametros);
    res.json({
      success: true,
      status: 200,
      message: 'OK',
      data: {
        productos
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


exports.getDisponibilidadProductoUbicaciones = async (req, res) => {
  try {
    const parametros = ObtenerProductoDisponibleDto.validate(req.params);
    const producto = await Servicio.obtenerDisponibilidadProductoUbicaciones(parametros);
    res.json({
      success: true,
      status: 200,
      message: 'OK',
      data: {
        producto
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


exports.getProductoDisponibleConUbicaciones = async (req, res) => {
  try {
    const parametros = ObtenerProductoDisponibleDto.validate(req.query);
    const producto = await Servicio.obtenerDisponibilidadProductoConUbicaciones(parametros);
    
    if (!producto) {
      return res.status(404).json({
        success: false,
        status: 404,
        message: 'Producto no encontrado',
        data: null
      });
    }

    res.json({
      success: true,
      status: 200,
      message: 'OK',
      data: {
        producto
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
