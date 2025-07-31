const db = require('../config/db');

exports.testConnection = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT 1 + 1 AS resultado');
        res.json({ resultado: rows[0].resultado });
    } catch (error) {
        console.error('Error en la conexión:', error);
        res.status(500).json({ error: 'Error al conectar con la base de datos' });
    }
};