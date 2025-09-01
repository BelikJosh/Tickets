import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

// Crear pool de conexiones para mejor rendimiento
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'tickets_mantenimiento',
  port: parseInt(process.env.DB_PORT || '3306'),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Convertir a promises para usar async/await
const promisePool = pool.promise();

// Verificar conexión
promisePool.getConnection()
  .then(connection => {
    console.log('Conectado a la base de datos MySQL');
    connection.release();
  })
  .catch(err => {
    console.error('Error conectando a la base de datos:', err);
  });

export default promisePool;