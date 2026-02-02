const mysql = require("mysql2");


const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "1234",        
  database: "DATING_APP"
});


db.connect((err) => {
  if (err) {
    console.error("❌ MySQL connection failed:", err.message);
  } else {
    console.log("✅ MySQL connected successfully");
  }
});

module.exports = db;
