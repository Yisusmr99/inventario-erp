const db = require('../config/db');

class UbicacionModel {
  static async create({ nombre_ubicacion, descripcion, capacidad }) {
    const sql = `INSERT INTO ubicacion (nombre_ubicacion, descripcion, capacidad) VALUES (?, ?, ?)`;
    const [result] = await db.execute(sql, [nombre_ubicacion, descripcion || null, capacidad]);
    return result.insertId;
  }

  static async existsByNombre(nombre_ubicacion, excludeId = null) {
    let sql = `SELECT id_ubicacion FROM ubicacion WHERE nombre_ubicacion = ?`;
    const params = [nombre_ubicacion];
    if (excludeId) {
      sql += ` AND id_ubicacion <> ?`;
      params.push(excludeId);
    }
    const [rows] = await db.execute(sql, params);
    return rows.length > 0;
  }

  static async findAll({ offset = 0, limit = 10, nombre_ubicacion, estado } = {}) {
    let sql = `SELECT * FROM ubicacion WHERE 1=1`;
    const params = [];
    if (nombre_ubicacion) {
      sql += ` AND nombre_ubicacion LIKE ?`;
      params.push(`%${nombre_ubicacion}%`);
    }
    if (estado !== undefined) {
      sql += ` AND estado = ?`;
      params.push(estado);
    }
    sql += ` ORDER BY id_ubicacion ASC LIMIT ? OFFSET ?`;
    params.push(Number(limit), Number(offset));
    const [rows] = await db.query(sql, params);
    return rows;
  }

  static async count({ nombre_ubicacion, estado } = {}) {
    let sql = `SELECT COUNT(*) AS total FROM ubicacion WHERE 1=1`;
    const params = [];
    if (nombre_ubicacion) {
      sql += ` AND nombre_ubicacion LIKE ?`;
      params.push(`%${nombre_ubicacion}%`);
    }
    if (estado !== undefined) {
      sql += ` AND estado = ?`;
      params.push(estado);
    }
    const [rows] = await db.query(sql, params);
    return rows[0]?.total ?? 0;
  }

  static async findById(id) {
    const sql = `SELECT * FROM ubicacion WHERE id_ubicacion = ?`;
    const [rows] = await db.execute(sql, [id]);
    return rows[0] || null;
  }

  static async update(id, { nombre_ubicacion, descripcion, capacidad }) {
    const sql = `UPDATE ubicacion SET nombre_ubicacion = ?, descripcion = ?, capacidad = ?, updated_at = NOW() WHERE id_ubicacion = ?`;
    const params = [nombre_ubicacion, descripcion || null, capacidad, id];
    const [result] = await db.execute(sql, params);
    return result.affectedRows > 0;
  }

  static async setEstado(id, estado) {
    const sql = `UPDATE ubicacion SET estado = ?, updated_at = NOW() WHERE id_ubicacion = ?`;
    const [result] = await db.execute(sql, [estado, id]);
    return result.affectedRows > 0;
  }
  
  static async findAllActivas() {
  const sql = `SELECT id_ubicacion, nombre_ubicacion 
               FROM ubicacion 
               WHERE estado = 1 
               ORDER BY nombre_ubicacion ASC`;
  const [rows] = await db.query(sql);
  return rows;
}



}

module.exports = UbicacionModel;
