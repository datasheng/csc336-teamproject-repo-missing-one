const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');

const db = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  port: process.env.MYSQL_PORT,
  multipleStatements: true
});

const initDatabase = async () => {
  return new Promise((resolve, reject) => {
    try {
      const sqlFile = path.join(__dirname, 'procedures', 'stored_procedures.sql');
      const sql = fs.readFileSync(sqlFile, 'utf8');
      
      db.query(sql, (err, results) => {
        if (err) {
          console.error('Error initializing database:', err);
          reject(err);
        }
        console.log('Stored procedures initialized successfully');
        db.end();
        resolve(results);
      });
    } catch (error) {
      console.error('Error reading SQL file:', error);
      reject(error);
    }
  });
};

module.exports = { initDatabase }; 