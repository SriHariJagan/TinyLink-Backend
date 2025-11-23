const mysql = require("mysql2");

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: "",
  database: process.env.DB_NAME,
  connectionLimit: 10,
});

pool.getConnection((err, connection) => {
  if (err) {
    console.error("DB Connection Failed:", err);
  } else {
    console.log("MySQL Connected");
    connection.release();
  }
});

module.exports = pool.promise();
