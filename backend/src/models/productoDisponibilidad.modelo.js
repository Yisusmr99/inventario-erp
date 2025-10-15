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

  // ------ EXISTENTES (para paginado) ------
  static async contarDisponiblesSimple({ conStock }) {
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

  static async listarDisponiblesSinPaginacion({ conStock, orden }) {
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
    `;
    const [filas] = await conexionBD.query(sql);
    return filas;
  }


  static async listarDisponiblesConUbicaciones({ conStock, orden }) {
    const ordenSql = this.aSqlOrdenSimple(orden);

    // Subconsulta para stock total por producto
        const sql = `
          SELECT
            t.id_producto,
            p.nombre,
            p.precio,
            t.stock_total,
            l.id_ubicacion,
            l.nombre_ubicacion,
            l.stock_ubicacion
          FROM (
            SELECT p.id_producto, COALESCE(SUM(i.cantidad_actual),0) AS stock_total
            FROM Producto p
            LEFT JOIN inventario i ON i.id_producto = p.id_producto
            WHERE p.estado = 1
            GROUP BY p.id_producto
          ) AS t
          JOIN Producto p ON p.id_producto = t.id_producto
          LEFT JOIN (
            SELECT
              i.id_producto,
              u.id_ubicacion,
              u.nombre_ubicacion AS nombre_ubicacion,
              COALESCE(SUM(i.cantidad_actual),0) AS stock_ubicacion
            FROM inventario i
            JOIN ubicacion u ON u.id_ubicacion = i.id_ubicacion
            WHERE u.estado = 1
            GROUP BY i.id_producto, u.id_ubicacion, u.nombre_ubicacion
          ) AS l
            ON l.id_producto = t.id_producto
          ${conStock ? 'WHERE t.stock_total > 0' : ''}
          ORDER BY ${ordenSql}, p.id_producto, l.nombre_ubicacion
        `;

        const [rows] = await conexionBD.query(sql);

        const mapa = new Map();
        for (const r of rows) {
          if (!mapa.has(r.id_producto)) {
            mapa.set(r.id_producto, {
              id_producto: r.id_producto,
              nombre: r.nombre,
              precio: Number(r.precio || 0),
              stock_total: Number(r.stock_total || 0),
              ubicaciones: []
            });
          }
          if (r.id_ubicacion != null) {
            const s = Number(r.stock_ubicacion || 0);
            if (s !== 0) {
              mapa.get(r.id_producto).ubicaciones.push({
                id_ubicacion: r.id_ubicacion,
                nombre: r.nombre_ubicacion,
                stock: s
              });
            }
          }
        }
        return Array.from(mapa.values());
      }

      static async obtenerDisponibilidadProductoConUbicaciones({ idProducto }) {
        const sql = `
          SELECT
            t.id_producto,
            p.nombre,
            p.precio,
            t.stock_total,
            l.id_ubicacion,
            l.nombre_ubicacion,
            l.stock_ubicacion
          FROM (
            SELECT p.id_producto, COALESCE(SUM(i.cantidad_actual),0) AS stock_total
            FROM Producto p
            LEFT JOIN inventario i ON i.id_producto = p.id_producto
            WHERE p.estado = 1 AND p.id_producto = ?
            GROUP BY p.id_producto
          ) AS t
          JOIN Producto p ON p.id_producto = t.id_producto
          LEFT JOIN (
            SELECT
              i.id_producto,
              u.id_ubicacion,
              u.nombre_ubicacion AS nombre_ubicacion,
              COALESCE(SUM(i.cantidad_actual),0) AS stock_ubicacion
            FROM inventario i
            JOIN ubicacion u ON u.id_ubicacion = i.id_ubicacion
            WHERE u.estado = 1 AND i.id_producto = ?
            GROUP BY i.id_producto, u.id_ubicacion, u.nombre_ubicacion
          ) AS l
            ON l.id_producto = t.id_producto
          ORDER BY p.id_producto, l.nombre_ubicacion
        `;

        const [rows] = await conexionBD.query(sql, [idProducto, idProducto]);

        if (rows.length === 0) {
          return null;
        }

        const producto = {
          id_producto: rows[0].id_producto,
          nombre: rows[0].nombre,
          precio: Number(rows[0].precio || 0),
          stock_total: Number(rows[0].stock_total || 0),
          ubicaciones: []
        };

        for (const r of rows) {
          if (r.id_ubicacion != null) {
            const s = Number(r.stock_ubicacion || 0);
            if (s !== 0) {
              producto.ubicaciones.push({
                id_ubicacion: r.id_ubicacion,
                nombre: r.nombre_ubicacion,
                stock: s
              });
            }
          }
        }

        return producto;
      }
  }

module.exports = ProductoDisponibilidadModelo;
