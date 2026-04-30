const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'mysql',
  user: 'user',
  password: 'user123',
  database: 'lab_db',
  waitForConnections: true,
  connectionLimit: 10
});

module.exports = pool;