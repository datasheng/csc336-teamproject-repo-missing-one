const express = require("express");
const bcrypt = require("bcrypt");
const mysql = require("mysql2");
const cors = require('cors');

const router = express.Router();

// Create MySQL connection pool
const db = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  port: process.env.MYSQL_PORT,
});

// **Register Endpoint**
router.post("/register", async (req, res) => {
  const { name, email, password, user_type, location } = req.body;

  const date_joined = Math.floor(Date.now() / 1000);

  if (!name || !email || !password || !["client", "contractor"].includes(user_type)) {
    return res.status(400).json({ error: "Invalid input" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    if (user_type === "client" && !location) {
      return res.status(400).json({ error: "Location is required for clients" });
    }

    if (user_type === "client") {
      const query = `
        INSERT INTO client (name, email, password, date_joined, location) 
        VALUES (?, ?, ?, ?, ?)
      `;
      
      db.execute(query, [name, email, hashedPassword, date_joined, location], (err, results) => {
        if (err) {
          return res.status(400).json({ error: err.message });
        }
        res.status(201).json({
          message: "Registration successful",
          userId: results.insertId
        });
      });
    } else {
      const query = `
        INSERT INTO contractor (name, email, password, date_joined) 
        VALUES (?, ?, ?, ?)
      `;
      
      db.execute(query, [name, email, hashedPassword, date_joined], (err, results) => {
        if (err) {
          return res.status(400).json({ error: err.message });
        }
        res.status(201).json({
          message: "Registration successful",
          userId: results.insertId
        });
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// **Login Endpoint**
router.post("/login", async (req, res) => {
  console.log("Login attempt:", req.body);
  
  const { email, password, user_type } = req.body;

  if (!email || !password || !["client", "contractor"].includes(user_type)) {
    return res.status(400).json({ error: "Invalid input" });
  }

  const table = user_type === "client" ? "client" : "contractor";
  const idField = user_type === "client" ? "client_id" : "contractor_id";
  
  const query = `SELECT ${idField}, name, email, password FROM ${table} WHERE email = ?`;

  db.execute(query, [email], async (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: err.message });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = results[0];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    res.status(200).json({ 
      message: `Welcome, ${user.name}!`,
      userId: user[idField],
      name: user.name,
      email: user.email,
      userType: user_type
    });
  });
});

module.exports = router;
