const express = require("express");
const mysql = require("mysql2");
const router = express.Router();

// Create MySQL connection pool
const db = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  port: process.env.MYSQL_PORT,
});

// Get all job listings
router.get("/", (req, res) => {
  const query = `
    SELECT 
      j.job_id,
      j.title,
      j.description,
      j.location,
      j.date_posted,
      j.status,
      j.min_salary,
      j.max_salary,
      j.actual_salary,
      j.rate_type,
      c.name as client_name
    FROM job j
    LEFT JOIN client c ON j.client_id = c.client_id
    ORDER BY j.date_posted DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Error fetching job listings" });
    }

    // Format the date to show only YYYY-MM-DD
    const formattedResults = results.map(job => ({
      ...job,
      date_posted: new Date(job.date_posted).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      min_salary: parseFloat(job.min_salary),
      max_salary: parseFloat(job.max_salary),
      actual_salary: parseFloat(job.actual_salary)
    }));

    res.json(formattedResults);
  });
});

// Add new job listing
router.post("/", (req, res) => {
  const {
    client_id,
    title,
    description,
    location,
    min_salary,
    max_salary,
    actual_salary,
    rate_type,
    status
  } = req.body;

  if (!client_id) {
    return res.status(400).json({ error: "Client ID is required" });
  }

  const query = `
    INSERT INTO job (
      client_id,
      title,
      description,
      location,
      status,
      min_salary,
      max_salary,
      actual_salary,
      rate_type
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    client_id,
    title,
    description,
    location,
    status,
    min_salary,
    max_salary,
    actual_salary,
    rate_type
  ];

  db.query(query, values, (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Error creating job listing" });
    }
    res.status(201).json({ message: "Job listing created successfully", job_id: result.insertId });
  });
});

module.exports = router;
