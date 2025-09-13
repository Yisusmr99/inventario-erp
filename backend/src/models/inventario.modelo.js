// src/models/inventario.modelo.js
const conexionBD = require('../config/db');

class InventarioModelo {
  static async obtenerProductoPorId(idProducto) {
    const [[filaProducto]] = await conexionBD.query(
      'SELECT id_producto, nombre, codigo FROM Producto WHERE id_producto=? LIMIT 1',
      [idProducto]
    );
    return filaProducto || null;
  }

  static async obtenerUbicacionPorId(idUbicacion) {
    const [[filaUbicacion]] = await conexionBD.query(
      'SELECT id_ubicacion, nombre_ubicacion, estado, capacidad FROM ubicacion WHERE id_ubicacion=? LIMIT 1',
      [idUbicacion]
    );
    return filaUbicacion || null;
  }


  static async resumenPorProducto(idProducto) {
    const producto = await this.obtenerProductoPorId(idProducto);
    if (!producto) return null;

    const [detallePorUbicacion] = await conexionBD.query(
      `SELECT i.id_inventario, i.id_producto, i.id_ubicacion,
              u.nombre_ubicacion AS ubicacion, u.estado, u.capacidad,
              i.cantidad_actual, i.stock_minimo, i.stock_maximo
       FROM inventario i
       JOIN ubicacion u ON u.id_ubicacion = i.id_ubicacion
       WHERE i.id_producto = ?
       ORDER BY u.nombre_ubicacion`,
      [idProducto]
    );

    const [[suma]] = await conexionBD.query(
      'SELECT COALESCE(SUM(cantidad_actual),0) AS total FROM inventario WHERE id_producto=?',
      [idProducto]
    );

    return { producto, detalle: detallePorUbicacion, total: suma.total };
  }

  static async obtenerTodosProductosConInventario() {
    const [inventarios] = await conexionBD.query(
      `SELECT 
        i.id_inventario,
        i.id_producto,
        i.id_ubicacion,
        i.cantidad_actual,
        i.stock_minimo,
        i.stock_maximo,
        p.nombre AS nombre_producto,
        p.codigo AS codigo_producto,
        u.nombre_ubicacion,
        u.estado AS estado_ubicacion,
        u.capacidad
       FROM inventario i
       JOIN Producto p ON p.id_producto = i.id_producto
       JOIN ubicacion u ON u.id_ubicacion = i.id_ubicacion
       ORDER BY p.nombre, u.nombre_ubicacion`
    );

    return inventarios;
  }

  static async obtenerProductosConInventarioPaginado({ offset = 0, limit = 10, search = null }) {
    let query = `
      SELECT 
        i.id_inventario,
        i.id_producto,
        i.id_ubicacion,
        i.cantidad_actual,
        i.stock_minimo,
        i.stock_maximo,
        p.nombre AS nombre_producto,
        p.codigo AS codigo_producto,
        u.nombre_ubicacion,
        u.estado AS estado_ubicacion,
        u.capacidad
      FROM inventario i
      JOIN Producto p ON p.id_producto = i.id_producto
      JOIN ubicacion u ON u.id_ubicacion = i.id_ubicacion
      WHERE p.estado = 1
    `;
    const params = [];

    if (search) {
      query += ` AND (p.nombre LIKE ? OR p.codigo LIKE ?)`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }

    query += ` ORDER BY p.nombre, u.nombre_ubicacion LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const [inventarios] = await conexionBD.query(query, params);
    return inventarios;
  }

  static async contarProductosConInventario(search = null) {
    let query = `
      SELECT COUNT(*) AS total
      FROM inventario i
      JOIN Producto p ON p.id_producto = i.id_producto
      JOIN ubicacion u ON u.id_ubicacion = i.id_ubicacion
      WHERE p.estado = 1
    `;
    const params = [];

    if (search) {
      query += ` AND (p.nombre LIKE ? OR p.codigo LIKE ?)`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }

    const [[result]] = await conexionBD.query(query, params);
    return result.total;
  }

  static async obtenerFilaPorProductoUbicacion(conexion, idProducto, idUbicacion, bloquear = false) {
    const sql = `SELECT id_inventario, id_producto, id_ubicacion, cantidad_actual, stock_minimo, stock_maximo
                 FROM inventario
                 WHERE id_producto=? AND id_ubicacion=?
                 LIMIT 1 ${bloquear ? 'FOR UPDATE' : ''}`;
    const [[filaInventario]] = await conexion.query(sql, [idProducto, idUbicacion]);
    return filaInventario || null;
  }

  static async obtenerFilaPorId(conexion, idInventario, bloquear = false) {
    const sql = `SELECT id_inventario, id_producto, id_ubicacion, cantidad_actual, stock_minimo, stock_maximo
                 FROM inventario
                 WHERE id_inventario=?
                 LIMIT 1 ${bloquear ? 'FOR UPDATE' : ''}`;
    const [[filaInventario]] = await conexion.query(sql, [idInventario]);
    return filaInventario || null;
  }

  static async existeParProductoUbicacion(conexion, idProducto, idUbicacion) {
    const [[existe]] = await conexion.query(
      'SELECT id_inventario FROM inventario WHERE id_producto=? AND id_ubicacion=? LIMIT 1',
      [idProducto, idUbicacion]
    );
    return !!existe;
  }

 
  static async actualizarSoloCantidad(conexion, idInventario, nuevaCantidad) {
    await conexion.query(
      'UPDATE inventario SET cantidad_actual=? WHERE id_inventario=?',
      [nuevaCantidad, idInventario]
    );
  }

  static async crearInventario(conexion, { idProducto, idUbicacion, cantidad, stockMinimo, stockMaximo }) {
    await conexion.query(
      `INSERT INTO inventario (id_producto, id_ubicacion, cantidad_actual, stock_minimo, stock_maximo)
       VALUES (?, ?, ?, ?, ?)`,
      [idProducto, idUbicacion, cantidad, stockMinimo, stockMaximo]
    );
  }

  static async editarInventario(conexion, { idInventario, stockMinimo = null, stockMaximo = null, idUbicacion = null }) {
    const columnasAActualizar = [];
    const valores = [];
    if (stockMinimo !== null && stockMinimo !== undefined) { columnasAActualizar.push('stock_minimo=?'); valores.push(stockMinimo); }
    if (stockMaximo !== null && stockMaximo !== undefined) { columnasAActualizar.push('stock_maximo=?'); valores.push(stockMaximo); }
    if (idUbicacion !== null && idUbicacion !== undefined) { columnasAActualizar.push('id_ubicacion=?'); valores.push(idUbicacion); }
    if (!columnasAActualizar.length) return;
    valores.push(idInventario);
    await conexion.query(`UPDATE inventario SET ${columnasAActualizar.join(', ')} WHERE id_inventario=?`, valores);
  }


  static async registrarBitacora(conexion, {
    idProducto,
    idUbicacionOrigen  = null,
    idUbicacionDestino = null,
    tipo,        // 'AJUSTE' | 'TRANSFERENCIA'
    cantidad,    // ±N en AJUSTE; >0 en TRANSFERENCIA
    motivo,
    usuario = 'sistema'
  }) {
    await conexion.query(
      `INSERT INTO bitacora_inventario
        (id_producto, id_ubicacion_origen, id_ubicacion_destino, tipo, cantidad, motivo, usuario)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [idProducto, idUbicacionOrigen, idUbicacionDestino, tipo, cantidad, motivo, usuario]
    );
  }
}

module.exports = InventarioModelo;
