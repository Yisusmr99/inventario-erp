// src/controllers/inventario.controlador.js
const InventarioServicio = require('../services/inventario.servicio');
const {
  AjusteInventarioDto,
  CrearInventarioDto,
  EditarInventarioDto,
  TransferirInventarioDto,
  ParametroProductoDto,
} = require('../dtos/inventario.dto');

exports.obtenerPorProducto = async (req, res) => {
  try {
    const { idProducto } = ParametroProductoDto.validate(req.params);
    const resumen = await InventarioServicio.obtenerPorProducto(idProducto);

    if (!resumen) {
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
      data: resumen
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

exports.ajustarCantidad = async (req, res) => {
  try {
    const datosAjuste = AjusteInventarioDto.validate(req.body);
    const resultado = await InventarioServicio.ajustarCantidad(datosAjuste);

    res.status(200).json({
      success: true,
      status: 200,
      message: 'Ajuste registrado',
      data: resultado
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

exports.crearInventario = async (req, res) => {
  try {
    const datosCreacion = CrearInventarioDto.validate(req.body);
    const inventarioCreado = await InventarioServicio.crearInventario(datosCreacion);

    res.status(201).json({
      success: true,
      status: 201,
      message: 'Inventario creado',
      data: inventarioCreado
    });
  } catch (error) {
    const codigo = error.message.includes('existe inventario') ? 409 : 400;
    res.status(codigo).json({
      success: false,
      status: codigo,
      message: error.message,
      data: null
    });
  }
};

exports.editarInventario = async (req, res) => {
  try {
    const datosEdicion = EditarInventarioDto.validate(req.body);
    const inventarioEditado = await InventarioServicio.editarInventario(datosEdicion);

    res.status(200).json({
      success: true,
      status: 200,
      message: 'Inventario editado',
      data: inventarioEditado
    });
  } catch (error) {
    const codigo = error.message.includes('ya existe inventario') ? 409 : 400;
    res.status(codigo).json({
      success: false,
      status: codigo,
      message: error.message,
      data: null
    });
  }
};

exports.transferir = async (req, res) => {
  try {
    const datosTransferencia = TransferirInventarioDto.validate(req.body);
    const resultado = await InventarioServicio.transferir(datosTransferencia);

    res.status(200).json({
      success: true,
      status: 200,
      message: 'Transferencia registrada',
      data: resultado
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

exports.obtenerTodosProductosConInventario = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const result = await InventarioServicio.obtenerTodosProductosConInventario({ 
      page: parseInt(page, 10), 
      limit: parseInt(limit, 10),
      search: search || null
    });

    // Construir URLs base
    const baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}${req.path}`;
    
    // Construir query params para las URLs
    const buildUrl = (pageNum) => {
      const params = new URLSearchParams();
      params.append('page', pageNum.toString());
      params.append('limit', limit.toString());
      if (search) params.append('search', search);
      return `${baseUrl}?${params.toString()}`;
    };

    // Agregar información adicional de paginación con URLs
    const response = {
      ...result,
      nextPage: result.hasNextPage ? result.currentPage + 1 : null,
      previousPage: result.hasPreviousPage ? result.currentPage - 1 : null,
      nextPageUrl: result.hasNextPage ? buildUrl(result.currentPage + 1) : null,
      previousPageUrl: result.hasPreviousPage ? buildUrl(result.currentPage - 1) : null,
      currentPageUrl: buildUrl(result.currentPage),
      firstPageUrl: buildUrl(1),
      lastPageUrl: result.totalPages > 0 ? buildUrl(result.totalPages) : null
    };

    res.json({
      success: true,
      status: 200,
      message: 'OK',
      data: response
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
