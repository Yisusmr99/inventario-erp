// Ruta: src/config/db.js

const mysql = require('mysql2/promise');

console.log('Connecting to the database...');

// La configuración está más limpia y lee las variables que ya cargó Server.js
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: { // <-- ¡Muy bien! Mantenemos esto para la conexión a Railway.
        rejectUnauthorized: false
    }
});

// Probamos la conexión para confirmar que todo funciona al arrancar.
pool.getConnection()
  .then(connection => {
    console.log('✅ Database connection successful!');
    connection.release();
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err.message);
  });

module.exports = pool;