const db = require('../config/db');

class ProductCategoryModel {
    /**
     * Crear una nueva categoría de producto
     */
    static async create({ nombre, descripcion, estado }) {
        // CORRECCIÓN: Usamos el nombre de columna 'is_active' en la base de datos
        const query = `
            INSERT INTO CategoriaProducto (nombre, descripcion, is_active)
            VALUES (?, ?, ?)
        `;
        const [result] = await db.execute(query, [nombre, descripcion || null, estado]);
        return result.insertId;
    }

    /**
     * Obtener todas las categorías de productos
     */
    static async findAll({ offset = 0, limit = 10, search = null } = {}) {
        // CORRECCIÓN: Se agrega la cláusula WHERE para filtrar por is_active = 1
        let query = `
            SELECT id_categoria, nombre, descripcion, is_active AS estado
            FROM CategoriaProducto
            WHERE is_active = 1
        `;
        const params = [];

        if (search) {
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
        // CORRECCIÓN: Usamos el nombre de columna 'is_active' y un alias
        const query = `
            SELECT id_categoria, nombre, descripcion, is_active AS estado
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
        // CORRECCIÓN: Usamos el nombre de columna 'is_active'.
        const query = `
            UPDATE CategoriaProducto
            SET nombre = ?, descripcion = ?, is_active = ?
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
