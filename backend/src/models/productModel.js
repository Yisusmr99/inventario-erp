const db = require('../config/db');

class ProductModel {
  static async create({ nombre, descripcion, categoriaId, codigo, precio }) {
    const sql = `
      INSERT INTO Producto (nombre, descripcion, id_categoria, codigo, precio, fecha_creacion)
      VALUES (?, ?, ?, ?, ?, CURDATE())
    `;
    const params = [nombre, descripcion || null, categoriaId, codigo, precio];
    const [result] = await db.execute(sql, params);
    return result.insertId;
  }

  static async existsByName(nombre, excludeId = null) {
    let sql = `SELECT id_producto FROM Producto WHERE nombre = ? AND estado = 1`;
    const params = [nombre];
    if (excludeId) {
      sql += ` AND id_producto <> ?`;
      params.push(excludeId);
    }
    const [rows] = await db.execute(sql, params);
    return rows.length > 0;
  }

  static async existsByCode(codigo, excludeId = null) {
    let sql = `SELECT id_producto FROM Producto WHERE codigo = ? AND estado = 1`;
    const params = [codigo];
    if (excludeId) {
      sql += ` AND id_producto <> ?`;
      params.push(excludeId);
    }
    const [rows] = await db.execute(sql, params);
    return rows.length > 0;
  }

  static async count({ nombre, categoriaId, codigo } = {}) {
    let sql = `
      SELECT COUNT(*) AS total
      FROM Producto p
      WHERE p.estado = 1
    `;
    const params = [];
    if (nombre) {
      sql += ` AND p.nombre LIKE ?`;
      params.push(`%${nombre}%`);
    }
    if (categoriaId) {
      sql += ` AND p.id_categoria = ?`;
      params.push(categoriaId);
    }
    if (codigo) {
      sql += ` AND p.codigo LIKE ?`;
      params.push(`%${codigo}%`);
    }
    const [rows] = await db.query(sql, params);
    return rows[0]?.total ?? 0;
  }

  static async findAll({ offset = 0, limit = 10, nombre, categoriaId, codigo } = {}) {
    let sql = `
      SELECT 
        p.id_producto, p.nombre, p.descripcion, p.id_categoria, p.codigo, p.precio,
        c.nombre AS categoria_nombre
      FROM Producto p
      LEFT JOIN CategoriaProducto c ON c.id_categoria = p.id_categoria
      WHERE p.estado = 1
    `;
    const params = [];
    if (nombre) {
      sql += ` AND p.nombre LIKE ?`;
      params.push(`%${nombre}%`);
    }
    if (categoriaId) {
      sql += ` AND p.id_categoria = ?`;
      params.push(categoriaId);
    }
    if (codigo) {
      sql += ` AND p.codigo LIKE ?`;
      params.push(`%${codigo}%`);
    }
    sql += ` ORDER BY p.id_producto ASC LIMIT ? OFFSET ?`;
    params.push(Number(limit), Number(offset));

    const [rows] = await db.query(sql, params);
    return rows;
  }

  static async findById(id) {
    const sql = `
      SELECT 
        p.id_producto, p.nombre, p.descripcion, p.id_categoria, p.codigo, p.precio,
        c.nombre AS categoria_nombre
      FROM Producto p
      LEFT JOIN CategoriaProducto c ON c.id_categoria = p.id_categoria
      WHERE p.id_producto = ? AND p.estado = 1
    `;
    const [rows] = await db.execute(sql, [id]);
    return rows[0] || null;
  }

  static async update(id, { nombre, descripcion, categoriaId, codigo, precio }) {
    const sql = `
      UPDATE Producto
      SET nombre = ?, descripcion = ?, id_categoria = ?, codigo = ?, precio = ?
      WHERE id_producto = ?
    `;
    const params = [nombre, descripcion || null, categoriaId, codigo, precio, id];
    const [result] = await db.execute(sql, params);
    return result.affectedRows > 0;
  }

  // FUNCION CORREGIDA: Ahora es una "eliminación suave" (soft-delete)
  static async delete(id) {
    const sql = `UPDATE Producto SET estado = 0 WHERE id_producto = ?`;
    const [result] = await db.execute(sql, [id]);
    return result.affectedRows > 0;
  }
}

module.exports = ProductModel;