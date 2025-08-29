// backend/src/models/productCategoryModel.js

const db = require('../config/db');

class ProductCategoryModel {
  static async create({ nombre, descripcion, estado }) {
    // VALIDACIÓN: Se añade una validación robusta para prevenir duplicados.
    const alreadyExists = await this.existsByName(nombre);
    if (alreadyExists) {
      const err = new Error('Ya existe una categoría con un nombre similar.');
      err.statusCode = 409; // 409 Conflict
      throw err;
    }

    const query = `
      INSERT INTO CategoriaProducto (nombre, descripcion, estado, fecha_creacion)
      VALUES (TRIM(?), ?, ?, CURDATE())
    `;
    const [result] = await db.execute(query, [nombre, descripcion || null, estado]);
    return result.insertId;
  }

  static async findAll({ offset = 0, limit = 10, search = null } = {}) {
    let query = `
      SELECT id_categoria, nombre, descripcion, estado, fecha_creacion
      FROM CategoriaProducto
      WHERE estado = 1
    `;
    const params = [];

    if (search) {
      query += ` AND (LOWER(nombre) LIKE LOWER(?) OR LOWER(descripcion) LIKE LOWER(?))`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }

    query += ` ORDER BY id_categoria ASC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const [rows] = await db.query(query, params);
    return rows;
  }

  static async findById(id) {
    const query = `
      SELECT id_categoria, nombre, descripcion, estado, fecha_creacion
      FROM CategoriaProducto
      WHERE id_categoria = ?
    `;
    const [rows] = await db.execute(query, [id]);
    return rows[0] || null;
  }

  static async update(id, { nombre, descripcion, estado }) {
    // VALIDACIÓN: Se añade una validación para prevenir duplicados al actualizar.
    const alreadyExists = await this.existsByName(nombre, id); // Excluir el ID actual de la comprobación
    if (alreadyExists) {
      const err = new Error('Ya existe otra categoría con un nombre similar.');
      err.statusCode = 409; // 409 Conflict
      throw err;
    }

    const query = `
      UPDATE CategoriaProducto
      SET nombre = TRIM(?), descripcion = ?, estado = ?
      WHERE id_categoria = ?
    `;
    const [result] = await db.execute(query, [nombre, descripcion || null, estado, id]);
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const query = `DELETE FROM CategoriaProducto WHERE id_categoria = ?`;
    const [result] = await db.execute(query, [id]);
    return result.affectedRows > 0;
  }

  // --- FUNCIÓN CORREGIDA ---
  // Ahora normaliza el nombre quitando TODOS los espacios y convirtiendo a minúsculas.
  static async existsByName(nombre, excludeId = null) {
    let query = `
      SELECT id_categoria
      FROM CategoriaProducto
      WHERE REPLACE(LOWER(nombre), ' ', '') = REPLACE(LOWER(?), ' ', '')
    `;
    const params = [nombre];

    if (excludeId) {
      query += ' AND id_categoria != ?';
      params.push(excludeId);
    }

    const [rows] = await db.execute(query, params);
    return rows.length > 0;
  }

  static async count(search = null) {
    let query = `SELECT COUNT(*) AS total FROM CategoriaProducto WHERE estado = 1`;
    const params = [];

    if (search) {
      query += ` AND (LOWER(nombre) LIKE LOWER(?) OR LOWER(descripcion) LIKE LOWER(?))`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }

    const [rows] = await db.execute(query, params);
    return rows[0].total;
  }
}

module.exports = ProductCategoryModel;
