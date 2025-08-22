const db = require('../config/db');

class ProductCategoryModel {
  /**
   * Crear una nueva categoría de producto
   */
  static async create({ nombre, descripcion, estado }) {
    // CHANGED: normaliza en SQL (TRIM) y deja la comparación futura consistente
    const query = `
      INSERT INTO CategoriaProducto (nombre, descripcion, estado, fecha_creacion)
      VALUES (TRIM(?), ?, ?, CURDATE())
    `;
    const [result] = await db.execute(query, [nombre, descripcion || null, estado]);
    return result.insertId;
  }

  /**
   * Obtener todas las categorías de productos
   */
  static async findAll({ offset = 0, limit = 10, search = null } = {}) {
    let query = `
      SELECT id_categoria, nombre, descripcion, estado, fecha_creacion
      FROM CategoriaProducto
      WHERE estado = 1
    `;
    const params = [];

    if (search) {
      // Opcional: buscar por término sin tocar espacios internos
      query += ` AND (nombre LIKE ? OR descripcion LIKE ?)`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }

    query += ` ORDER BY id_categoria ASC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const [rows] = await db.query(query, params);
    return rows;
  }

  /**
   * Obtener una categoría por ID
   */
  static async findById(id) {
    const query = `
      SELECT id_categoria, nombre, descripcion, estado, fecha_creacion
      FROM CategoriaProducto
      WHERE id_categoria = ?
    `;
    const [rows] = await db.execute(query, [id]);
    return rows[0] || null;
  }

  /**
   * Actualizar una categoría de producto
   */
  static async update(id, { nombre, descripcion, estado }) {
    // CHANGED: TRIM al guardar
    const query = `
      UPDATE CategoriaProducto
      SET nombre = TRIM(?), descripcion = ?, estado = ?
      WHERE id_categoria = ?
    `;
    const [result] = await db.execute(query, [nombre, descripcion || null, estado, id]);
    return result.affectedRows > 0;
  }

  /**
   * Eliminar una categoría de producto
   */
  static async delete(id) {
    const query = `DELETE FROM CategoriaProducto WHERE id_categoria = ?`;
    const [result] = await db.execute(query, [id]);
    return result.affectedRows > 0;
  }

  /**
   * Verificar si existe una categoría con el mismo nombre
   * - CHANGED: compara nombre normalizado (TRIM + LOWER) y permite excluir ID
   */
  static async existsByName(nombre, excludeId = null) {
    let query = `
      SELECT id_categoria
      FROM CategoriaProducto
      WHERE TRIM(LOWER(nombre)) = TRIM(LOWER(?))
    `;
    const params = [nombre];

    if (excludeId) {
      query += ' AND id_categoria != ?';
      params.push(excludeId);
    }

    const [rows] = await db.execute(query, params);
    return rows.length > 0;
  }

  /**
   * Contar el número total de categorías de producto
   */
  static async count(search = null) {
    let query = `SELECT COUNT(*) AS total FROM CategoriaProducto`;
    const params = [];

    if (search) {
      query += ` WHERE nombre LIKE ? OR descripcion LIKE ?`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }

    const [rows] = await db.execute(query, params);
    return rows[0].total;
  }
}

module.exports = ProductCategoryModel;