const express = require("express");
const mysql = require("mysql2");
const router = express.Router();

// Create MySQL connection pool with promise wrapper
const db = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  port: process.env.MYSQL_PORT,
}).promise();


router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Get all job listings
router.get("/", async (req, res) => {
  try {
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

    const [results] = await db.query(query);

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
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Error fetching job listings" });
  }
});

router.post("/check-application", async (req, res) => {
  const { contractor_id, job_id } = req.body;
  console.log("Checking application for:", { contractor_id, job_id });

  try {
    const query = "SELECT * FROM job_application WHERE contractor_id = ? AND job_id = ?";
    const [results] = await db.query(query, [contractor_id, job_id]);
    
    console.log("Check results:", results);

    res.status(200).json({ 
      applied: results.length > 0,
      message: results.length > 0 ? "Already applied" : "Not applied yet"
    });
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Error checking application status" });
  }
});

router.post("/apply", async (req, res) => {
  console.log("Received application:", req.body);
  const { contractor_id, job_id, tell_answer, fit_answer, ambitious_answer, location } = req.body;
  
  // Fix the date format
  const date_applied = new Date().toISOString().split('T')[0] + ' ' + 
                      new Date().toTimeString().split(' ')[0];
  const status = "Pending";

  try {
    const query = `
      INSERT INTO job_application (
        contractor_id, 
        job_id, 
        date_applied, 
        status, 
        tell_answer, 
        fit_answer, 
        ambitious_answer, 
        location
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.query(query, [
      contractor_id, 
      job_id, 
      date_applied, 
      status, 
      tell_answer, 
      fit_answer, 
      ambitious_answer, 
      location
    ]);

    console.log("Application submitted successfully:", result);

    res.status(201).json({ 
      message: "Job application submitted successfully",
      application_id: result.insertId 
    });
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ 
      error: "Error submitting job application",
      details: err.message 
    });
  }
});

//POST endpoint to use the stored procedure
router.post("/", async (req, res) => {
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

  try {
    // Call the stored procedure
    await db.query('SET @new_job_id = 0');
    await db.query(
      'CALL sp_add_job(?, ?, ?, ?, ?, ?, ?, ?, ?, @new_job_id)',
      [client_id, title, description, location, status, min_salary, max_salary, actual_salary, rate_type]
    );

    // Get the new job ID
    const [result] = await db.query('SELECT @new_job_id as job_id');
    const newJobId = result[0].job_id;

    res.status(201).json({ 
      message: "Job listing created successfully", 
      job_id: newJobId 
    });
  } catch (err) {
    console.error("Database error:", err);
    // Check if this is a stored procedure error (sqlState '45000')
    if (err.sqlState === '45000') {
      return res.status(400).json({ error: err.sqlMessage });
    }
    res.status(500).json({ error: "Error creating job listing" });
  }
});

router.get("/applied-jobs/:contractor_id", async (req, res) => {
  const { contractor_id } = req.params;
  try {
    const query = `
      SELECT 
        j.*,
        ja.status AS application_status,
        ja.date_applied,
        ja.tell_answer,
        ja.fit_answer,
        ja.ambitious_answer,
        c.name as client_name
      FROM job_application ja
      JOIN job j ON ja.job_id = j.job_id
      LEFT JOIN client c ON j.client_id = c.client_id
      WHERE ja.contractor_id = ?
      ORDER BY ja.date_applied DESC
    `;

    const [results] = await db.query(query, [contractor_id]);

    const formattedResults = results.map(job => ({
      ...job,
      date_posted: new Date(job.date_posted).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      date_applied: new Date(job.date_applied).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      min_salary: parseFloat(job.min_salary),
      max_salary: parseFloat(job.max_salary),
      actual_salary: parseFloat(job.actual_salary)
    }));

    res.json(formattedResults);
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Error fetching applied jobs" });
  }
});

// Fetch listing status
router.get("/status/:job_id", async (req, res) => {
  const { job_id } = req.params;
  const query = "SELECT status FROM job WHERE job_id = ?";

  try {
    const [results] = await db.query(query, [job_id]);

    if (results.length === 0) {
      return res.status(404).json({ error: "Listing not found" });
    }

    console.log("Status for job", job_id, ":", results[0].status);
    res.json({ status: results[0].status });
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Error fetching listing status" });
  }
});

// Close a listing
router.put("/close/:job_id", async (req, res) => {
  const { job_id } = req.params;
  try {
    const [result] = await db.query(
      "UPDATE job SET status = 'Closed' WHERE job_id = ?",
      [job_id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Listing not found" });
    }
    
    res.json({ success: true, status: 'Closed' });
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Error closing listing" });
  }
});

// Reopen a listing
router.put("/reopen/:job_id", async (req, res) => {
  const { job_id } = req.params;
  try {
    const [result] = await db.query(
      "UPDATE job SET status = 'Open' WHERE job_id = ?",
      [job_id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Listing not found" });
    }
    
    res.json({ success: true, status: 'Open' });
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Error reopening listing" });
  }
});

// Get job by ID
router.get("/job/:id", async (req, res) => {
  try {
    const { id } = req.params;
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
      WHERE j.job_id = ?
    `;

    const [results] = await db.query(query, [id]);

    if (results.length === 0) {
      return res.status(404).json({ error: "Job not found" });
    }

    // Format the job details
    const job = {
      ...results[0],
      date_posted: new Date(results[0].date_posted).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      min_salary: parseFloat(results[0].min_salary),
      max_salary: parseFloat(results[0].max_salary),
      actual_salary: parseFloat(results[0].actual_salary)
    };

    res.json(job);
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Error fetching job details" });
  }
});

// Endpoint to fetch applicants for a job
router.get("/applicants/:job_id", async (req, res) => {
  const { job_id } = req.params;
  
  try {
    // First check if the job exists
    const [jobCheck] = await db.query(
      'SELECT job_id FROM job WHERE job_id = ?',
      [job_id]
    );

    if (jobCheck.length === 0) {
      return res.status(404).json({ error: "Job not found" });
    }

    const query = `
      SELECT 
        ja.*,
        c.name,
        c.email,
        p.phone_number,
        p.bio,
        j.status as job_status
      FROM job_application ja
      JOIN contractor c ON ja.contractor_id = c.contractor_id
      JOIN profile p ON c.contractor_id = p.contractor_id
      JOIN job j ON ja.job_id = j.job_id
      WHERE ja.job_id = ?
    `;

    const [results] = await db.query(query, [job_id]);
    console.log("Fetched applicants for job", job_id, ":", results);
    
    res.json(results);
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ 
      error: "Error fetching applicants",
      details: err.message,
      stack: err.stack // for debugging
    });
  }
});

module.exports = router;
