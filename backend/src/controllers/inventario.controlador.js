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
