const conexionBD = require('../config/db');

class ProductoDisponibilidadModelo {
  // Mapear orden a SQL seguro
  static aSqlOrdenSimple(orden) {
    switch (orden) {
      case 'stock_asc':  return 'stock_total ASC';
      case 'nombre_asc': return 'p.nombre ASC';
      case 'stock_desc':
      default:           return 'stock_total DESC';
    }
  }

  static async contarDisponiblesSimple({ conStock }) {
    // Contamos por agrupación para poder aplicar HAVING
    const sql = `
      SELECT COUNT(*) AS total FROM (
        SELECT p.id_producto
        FROM Producto p
        LEFT JOIN inventario i ON i.id_producto = p.id_producto
        WHERE p.estado = 1
        GROUP BY p.id_producto
        ${conStock ? 'HAVING COALESCE(SUM(i.cantidad_actual),0) > 0' : ''}
      ) t
    `;
    const [[fila]] = await conexionBD.query(sql);
    return Number(fila?.total || 0);
  }

  static async listarDisponiblesSimple({ offset, limit, conStock, orden }) {
    const ordenSql = this.aSqlOrdenSimple(orden);
    const sql = `
      SELECT
        p.id_producto,
        p.nombre,
        COALESCE(SUM(i.cantidad_actual),0) AS stock_total
      FROM Producto p
      LEFT JOIN inventario i ON i.id_producto = p.id_producto
      WHERE p.estado = 1
      GROUP BY p.id_producto, p.nombre
      ${conStock ? 'HAVING stock_total > 0' : ''}
      ORDER BY ${ordenSql}
      LIMIT ? OFFSET ?
    `;
    const [filas] = await conexionBD.query(sql, [limit, offset]);
    return filas;
  }
}

module.exports = ProductoDisponibilidadModelo;
