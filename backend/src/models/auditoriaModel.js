const db = require('../config/db');


class AuditoriaModel {
  static async registrar(tabla, id_registro, accion, usuario) {
    const sql = `INSERT INTO auditoria_ubicacion (tabla, id_registro, accion, usuario, fecha) VALUES (?, ?, ?, ?, NOW())`;
    await db.execute(sql, [tabla, id_registro, accion, usuario]);
  }
}

module.exports = AuditoriaModel;
