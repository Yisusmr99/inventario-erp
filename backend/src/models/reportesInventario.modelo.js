// src/models/reportesInventario.modelo.js
const conexionBD = require('../config/db');

class ReportesInventarioModelo {
  /* ======================================================================
   *  NIVELES (stock y valor actual por producto; opcional por ubicación)
   * ==================================================================== */

  static aOrdenNiveles(orden) {
    switch (orden) {
      case 'valor_asc':  return 'valor_total ASC';
      case 'stock_desc': return 'stock_total DESC';
      case 'stock_asc':  return 'stock_total ASC';
      case 'nombre_asc': return 'p.nombre ASC';
      case 'valor_desc':
      default:           return 'valor_total DESC';
    }
  }

  /** Cuenta productos para paginación (filtros: categoría/ubicación/solo con stock). */
  static async contarNiveles({ idCategoria, idUbicacion, conStock }) {
    let expresionStockMostrar = 'COALESCE(SUM(i.cantidad_actual),0)';
    const condicionesProducto = ['p.estado = 1'];
    const parametros = [];

    if (idUbicacion != null) {
      expresionStockMostrar =
        'COALESCE(SUM(CASE WHEN i.id_ubicacion = ? THEN i.cantidad_actual ELSE 0 END),0)';
      parametros.push(idUbicacion);
    }

    if (idCategoria != null) {
      condicionesProducto.push('p.id_categoria = ?');
    }

    const condiciones = condicionesProducto.join(' AND ');

    const consultaSQL = `
      SELECT COUNT(*) AS total
      FROM (
        SELECT
          p.id_producto,
          ${expresionStockMostrar} AS stock_mostrar
        FROM Producto p
        LEFT JOIN inventario i ON i.id_producto = p.id_producto
        WHERE ${condiciones}
        GROUP BY p.id_producto
        ${conStock ? 'HAVING stock_mostrar > 0' : ''}
      ) t
    `;

    if (idCategoria != null) parametros.push(idCategoria);

    const [[fila]] = await conexionBD.query(consultaSQL, parametros);
    return Number(fila?.total || 0);
  }

  /** Lista productos con stock_total, stock_mostrar y valor_total (paginado y ordenado). */
  static async listarNiveles({
    offset,
    limit,
    idCategoria,
    idUbicacion,
    conStock,
    orden,
  }) {
    let expresionStockMostrar = 'COALESCE(SUM(i.cantidad_actual),0)';
    const condicionesProducto = ['p.estado = 1'];
    const parametros = [];

    if (idUbicacion != null) {
      expresionStockMostrar =
        'COALESCE(SUM(CASE WHEN i.id_ubicacion = ? THEN i.cantidad_actual ELSE 0 END),0)';
      parametros.push(idUbicacion); // stock_mostrar
      parametros.push(idUbicacion); // valor_total
    }

    if (idCategoria != null) {
      condicionesProducto.push('p.id_categoria = ?');
    }

    const condiciones = condicionesProducto.join(' AND ');

    const consultaSQL = `
      SELECT
        p.id_producto,
        p.nombre,
        p.codigo,
        p.precio,
        COALESCE(SUM(i.cantidad_actual),0) AS stock_total,
        ${expresionStockMostrar} AS stock_mostrar,
        (${expresionStockMostrar}) * p.precio AS valor_total
      FROM Producto p
      LEFT JOIN inventario i ON i.id_producto = p.id_producto
      WHERE ${condiciones}
      GROUP BY p.id_producto
      ${conStock ? 'HAVING stock_mostrar > 0' : ''}
      ORDER BY ${this.aOrdenNiveles(orden)}
      LIMIT ? OFFSET ?
    `;

    if (idCategoria != null) parametros.push(idCategoria);
    parametros.push(limit, offset);

    const [filas] = await conexionBD.query(consultaSQL, parametros);
    return filas;
  }

  /* ======================================================================
   *  TOP MOVIMIENTOS (según bitácora AJUSTE en rango de fechas)  **NO TOCAR**
   *  tipo: 'ventas' (negativos), 'compras' (positivos), 'neto' (ambos)
   * ==================================================================== */
  static async topMovimientos({ fechaDesde, fechaHasta, limite, tipo }) {
    let condicionSigno = '';
    if (tipo === 'ventas')  condicionSigno = 'AND b.cantidad < 0';
    if (tipo === 'compras') condicionSigno = 'AND b.cantidad > 0';

    const consultaSQL = `
      SELECT
        p.id_producto,
        p.nombre,
        SUM(ABS(b.cantidad))            AS unidades_movidas,
        SUM(ABS(b.cantidad)) * p.precio AS valor_movido
      FROM bitacora_inventario b
      JOIN Producto p ON p.id_producto = b.id_producto
      WHERE b.tipo = 'AJUSTE'
        AND DATE(b.created_at) BETWEEN ? AND ?
        ${condicionSigno}
      GROUP BY p.id_producto, p.nombre, p.precio
      ORDER BY unidades_movidas DESC, p.nombre ASC
      LIMIT ?
    `;

    const [filas] = await conexionBD.query(consultaSQL, [fechaDesde, fechaHasta, limite]);
    return filas.map(fila => ({
      id_producto: fila.id_producto,
      nombre: fila.nombre,
      unidades_movidas: Number(fila.unidades_movidas || 0),
      valor_movido: Number(fila.valor_movido || 0),
    }));
  }

  /* ======================================================================
   *  SLOW MOVERS (incluye SIN MOVIMIENTO) — excluye TOP rápidos
   *  - NO devuelve stock
   *  - conStock: si true, filtra por stock actual > 0
   *  - excluirTop: cuántos del top rápidos excluir (default 10)
   * ==================================================================== */
  static async productosLentos({ conStock, excluirTop = 10 }) {
    const sql = `
      SELECT
        p.id_producto,
        p.nombre,
        COALESCE(v.unidades_vendidas, 0) AS unidades_vendidas
      FROM Producto p
      /* Ventas acumuladas (negativas => unidades vendidas) */
      LEFT JOIN (
        SELECT b.id_producto, SUM(-b.cantidad) AS unidades_vendidas
        FROM bitacora_inventario b
        WHERE b.cantidad < 0
        GROUP BY b.id_producto
      ) v ON v.id_producto = p.id_producto
      /* Stock solo para filtrar cuando con_stock=1 (no se devuelve) */
      LEFT JOIN (
        SELECT i.id_producto, COALESCE(SUM(i.cantidad_actual),0) AS stock_total
        FROM inventario i
        GROUP BY i.id_producto
      ) s ON s.id_producto = p.id_producto
      /* Top rápidos a excluir (top N por ventas desc) */
      LEFT JOIN (
        SELECT id_producto
        FROM (
          SELECT b.id_producto, SUM(-b.cantidad) AS unidades_vendidas
          FROM bitacora_inventario b
          WHERE b.cantidad < 0
          GROUP BY b.id_producto
          ORDER BY unidades_vendidas DESC
          LIMIT ?
        ) t_fast
      ) f ON f.id_producto = p.id_producto
      WHERE p.estado = 1
        ${conStock ? 'AND COALESCE(s.stock_total,0) > 0' : ''}
        AND f.id_producto IS NULL
      ORDER BY
        COALESCE(v.unidades_vendidas, 0) ASC,
        p.nombre ASC
    `;
    const [rows] = await conexionBD.query(sql, [excluirTop]);

    return rows.map(r => ({
      id_producto: r.id_producto,
      nombre: r.nombre,
      unidades_vendidas: Number(r.unidades_vendidas || 0),
    }));
  }

  /* ======================================================================
   *  FAST MOVERS (Top N por ventas acumuladas)
   *  - NO devuelve stock
   *  - conStock: si true, filtra por stock actual > 0
   * ==================================================================== */
  static async productosRapidos({ limite = 10, conStock }) {
    const sql = `
      SELECT
        p.id_producto,
        p.nombre,
        COALESCE(v.unidades_vendidas, 0) AS unidades_vendidas
      FROM Producto p
      LEFT JOIN (
        SELECT b.id_producto, SUM(-b.cantidad) AS unidades_vendidas
        FROM bitacora_inventario b
        WHERE b.cantidad < 0
        GROUP BY b.id_producto
      ) v ON v.id_producto = p.id_producto
      /* Stock solo para filtrar cuando con_stock=1 (no se devuelve) */
      LEFT JOIN (
        SELECT i.id_producto, COALESCE(SUM(i.cantidad_actual),0) AS stock_total
        FROM inventario i
        GROUP BY i.id_producto
      ) s ON s.id_producto = p.id_producto
      WHERE p.estado = 1
        AND COALESCE(v.unidades_vendidas,0) > 0
        ${conStock ? 'AND COALESCE(s.stock_total,0) > 0' : ''}
      ORDER BY v.unidades_vendidas DESC, p.nombre ASC
      LIMIT ?
    `;
    const [rows] = await conexionBD.query(sql, [limite]);

    return rows.map(r => ({
      id_producto: r.id_producto,
      nombre: r.nombre,
      unidades_vendidas: Number(r.unidades_vendidas || 0),
    }));
  }
}

module.exports = ReportesInventarioModelo;
