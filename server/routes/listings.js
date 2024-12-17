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


router.get("/job/:job_id", async (req, res) => {
  const { job_id } = req.params;
  const query = `SELECT * FROM job WHERE job_id = ?`;

  db.query(query, [job_id], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Error fetching job details" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Job not found" });
    }

    const job = results[0];
    const formattedJob = {
      ...job,
      date_posted: new Date(job.date_posted).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      min_salary: parseFloat(job.min_salary).toLocaleString('en-US'),
      max_salary: parseFloat(job.max_salary).toLocaleString('en-US'),
      actual_salary: parseFloat(job.actual_salary).toLocaleString('en-US')
    };

    res.json(formattedJob);
  });
});

router.post("/check-application", async (req, res) => {
  const { contractor_id, job_id } = req.body;
  const query = "SELECT * FROM job_application WHERE contractor_id = ? AND job_id = ?";

  db.query(query, [contractor_id, job_id], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Error checking application status" });
    }

    if (results.length > 0) {
      return res.status(200).json({ applied: true });
    }

    res.status(200).json({ applied: false });
  });
});

router.post("/apply", async (req, res) => {
  const { contractor_id, job_id, tell_answer, fit_answer, ambitious_answer, location } = req.body;
  const application_date = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const date_applied = Date.now();
  const status = "Pending";

  const query = `
    INSERT INTO job_application (contractor_id, job_id, application_date, date_applied, status, tell_answer, fit_answer, ambitious_answer, location)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(query, [contractor_id, job_id, application_date, date_applied, status, tell_answer, fit_answer, ambitious_answer, location], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Error submitting job application" });
    }

    res.status(201).json({ message: "Job application submitted successfully" });
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

router.get("/applied-jobs/:contractor_id", async (req, res) => {
  const { contractor_id } = req.params;
  const query = `
    SELECT job.*, job_application.status AS application_status FROM job_application
    JOIN job ON job_application.job_id = job.job_id
    WHERE job_application.contractor_id = ?
  `;

  db.query(query, [contractor_id], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Error fetching applied jobs" });
    }

    const formattedResults = results.map(job => ({
      ...job,
      date_posted: new Date(job.date_posted).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      min_salary: parseFloat(job.min_salary).toLocaleString('en-US', { minimumFractionDigits: 2 }),
      max_salary: parseFloat(job.max_salary).toLocaleString('en-US', { minimumFractionDigits: 2 }),
      actual_salary: parseFloat(job.actual_salary).toLocaleString('en-US', { minimumFractionDigits: 2 }),
      application_status: job.application_status
    }));

    res.json(formattedResults);
  });
});


module.exports = router;
