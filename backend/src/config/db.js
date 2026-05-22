const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     process.env.DB_PORT     || 5432,
  database: process.env.DB_NAME     || 'conveniosbd',
  user:     process.env.DB_USER     || 'postgres',
  password: process.env.DB_PASSWORD || 'user123',
});

pool.connect((err) => {
  if (err) {
    console.error('❌ Error conectando a la base de datos:', err.message);
  } else {
    console.log('✅ Conectado a PostgreSQL');
  }
});

module.exports = pool;
