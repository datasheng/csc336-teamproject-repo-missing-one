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

//create a profile --> should be done immediatly after registering with an empty bio & phone number
router.post("/profile/create", (req, res) => {
    const { contractor_id, bio = "", phone_number = null, role_status} = req.body;

    const query = `INSERT INTO profile (contractor_id, bio, phone_number, role_status) VALUES (?, ?, ?, ?)`;

    db.execute(query, [contractor_id, bio, phone_number, role_status], (err, results) => {
        if (err) {
            console.error("Error inserting profile into database:", err);
            return res.status(500).json({ error: "Failed to create profile." });
        }

        res.status(201).json({
            message: "Profile created successfully",
            profile_id: results.insertId,
        });
    });
});

router.get("/profile/:contractor_id", async (req, res) => {
    const { contractor_id } = req.params;
    const query = `SELECT * FROM profile WHERE contractor_id = ?`;

    db.execute(query, [contractor_id], async (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: err.message });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: "Profile not found" });
        }

        const profile = results[0];
        res.status(200).json(profile);
    });
});

router.put("/profile/:contractor_id", async (req, res) => {
    const { contractor_id } = req.params;
    const { bio, phone_number, role_status } = req.body;

    const query = `
        UPDATE profile
        SET bio = ?, phone_number = ?, role_status = ?
        WHERE contractor_id = ?
    `;

    db.execute(query, [bio, phone_number, role_status, contractor_id], (err, results) => {
        if (err) {
            console.error("Error updating profile:", err);
            return res.status(500).json({ error: "Database error" });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ error: "Profile not found" });
        }

        res.status(200).json({ message: "Profile updated successfully" });
    });
});



module.exports = router;