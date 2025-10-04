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

    // Si hay ubicación, la usamos en el SELECT (1 placeholder)
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

    // La expresión se usa DOS veces en el SELECT (stock_mostrar y valor_total),
    // por eso si hay id_ubicacion debemos empujarla dos veces en el arreglo.
    if (idUbicacion != null) {
      expresionStockMostrar =
        'COALESCE(SUM(CASE WHEN i.id_ubicacion = ? THEN i.cantidad_actual ELSE 0 END),0)';
      parametros.push(idUbicacion); // para stock_mostrar
      parametros.push(idUbicacion); // para valor_total
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
   *  TOP MOVIMIENTOS (según bitácora AJUSTE en rango de fechas)
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
   *  SLOW MOVERS (poco movimiento; más días sin moverse primero)
   *  Subconsulta para ordenar por alias de agregado sin errores.
   * ==================================================================== */
  static async productosLentos({ limite, conStock }) {
    const consultaSQL = `
      SELECT
        resumen.id_producto,
        resumen.nombre,
        resumen.stock_total,
        resumen.fecha_ultimo_movimiento,
        resumen.dias_sin_movimiento
      FROM (
        SELECT
          p.id_producto,
          p.nombre,
          COALESCE(SUM(i.cantidad_actual),0) AS stock_total,
          MAX(CASE WHEN b.tipo = 'AJUSTE' THEN b.created_at ELSE NULL END) AS fecha_ultimo_movimiento,
          DATEDIFF(
            CURDATE(),
            MAX(CASE WHEN b.tipo = 'AJUSTE' THEN b.created_at ELSE NULL END)
          ) AS dias_sin_movimiento
        FROM Producto p
        LEFT JOIN inventario i ON i.id_producto = p.id_producto
        LEFT JOIN bitacora_inventario b ON b.id_producto = p.id_producto
        WHERE p.estado = 1
        GROUP BY p.id_producto, p.nombre
        ${conStock ? 'HAVING stock_total > 0' : ''}
      ) AS resumen
      ORDER BY
        (resumen.dias_sin_movimiento IS NULL) ASC,
        resumen.dias_sin_movimiento DESC,
        resumen.nombre ASC
      LIMIT ?
    `;

    const [filas] = await conexionBD.query(consultaSQL, [limite]);

    return filas.map(fila => ({
      id_producto: fila.id_producto,
      nombre: fila.nombre,
      stock_total: Number(fila.stock_total || 0),
      fecha_ultimo_movimiento: fila.fecha_ultimo_movimiento,
      dias_sin_movimiento:
        fila.dias_sin_movimiento == null ? null : Number(fila.dias_sin_movimiento),
    }));
  }

  /* ======================================================================
   *  FAST MOVERS (movimiento más reciente; menos días sin moverse primero)
   *  También en subconsulta para ordenar estable.
   * ==================================================================== */
  static async productosRapidos({ limite, conStock }) {
    const consultaSQL = `
      SELECT
        resumen.id_producto,
        resumen.nombre,
        resumen.stock_total,
        resumen.fecha_ultimo_movimiento,
        resumen.dias_sin_movimiento
      FROM (
        SELECT
          p.id_producto,
          p.nombre,
          COALESCE(SUM(i.cantidad_actual),0) AS stock_total,
          MAX(CASE WHEN b.tipo = 'AJUSTE' THEN b.created_at ELSE NULL END) AS fecha_ultimo_movimiento,
          DATEDIFF(
            CURDATE(),
            MAX(CASE WHEN b.tipo = 'AJUSTE' THEN b.created_at ELSE NULL END)
          ) AS dias_sin_movimiento
        FROM Producto p
        LEFT JOIN inventario i ON i.id_producto = p.id_producto
        LEFT JOIN bitacora_inventario b ON b.id_producto = p.id_producto
        WHERE p.estado = 1
        GROUP BY p.id_producto, p.nombre
        ${conStock ? 'HAVING stock_total > 0' : ''}
      ) AS resumen
      ORDER BY
        (resumen.dias_sin_movimiento IS NULL) ASC,
        resumen.dias_sin_movimiento ASC,
        resumen.fecha_ultimo_movimiento DESC,
        resumen.nombre ASC
      LIMIT ?
    `;

    const [filas] = await conexionBD.query(consultaSQL, [limite]);

    return filas.map(fila => ({
      id_producto: fila.id_producto,
      nombre: fila.nombre,
      stock_total: Number(fila.stock_total || 0),
      fecha_ultimo_movimiento: fila.fecha_ultimo_movimiento,
      dias_sin_movimiento:
        fila.dias_sin_movimiento == null ? null : Number(fila.dias_sin_movimiento),
    }));
  }
}

module.exports = ReportesInventarioModelo;
