const db = require('../config/db');

class ProductCategoryModel {
    /**
     * Crear una nueva categoría de producto
     */
    static async create({ nombre, descripcion, estado }) {
        const query = `
            INSERT INTO CategoriaProducto (nombre, descripcion, estado, fecha_creacion)
            VALUES (?, ?, ?, CURDATE())
        `;
        const [result] = await db.execute(query, [nombre, descripcion || null, estado]);
        return result.insertId;
    }

    /**
     * Obtener todas las categorías de productos
     */
    static async findAll() {
        const query = `
            SELECT id_categoria, nombre, descripcion, estado, fecha_creacion
            FROM CategoriaProducto
            ORDER BY nombre ASC
        `;
        const [rows] = await db.execute(query);
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
        const query = `
            UPDATE CategoriaProducto
            SET nombre = ?, descripcion = ?, estado = ?
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
     */
    static async existsByName(nombre, excludeId = null) {
        let query = `SELECT id_categoria FROM CategoriaProducto WHERE nombre = ?`;
        const params = [nombre];
        
        if (excludeId) {
            query += ' AND id_categoria != ?';
            params.push(excludeId);
        }
        
        const [rows] = await db.execute(query, params);
        return rows.length > 0;
    }
}

module.exports = ProductCategoryModel;
