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
router.post("/create", (req, res) => {
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

router.get("/:contractor_id", async (req, res) => {
    const { contractor_id } = req.params;
    const query = `SELECT * FROM profile WHERE contractor_id = ?`;

    db.execute(query, [contractor_id], async (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: err.message });
        }

        if (results.length === 0) {
            // Profile not found, create a default profile
            const insertQuery = `INSERT INTO profile (contractor_id, bio, phone_number, role_status) VALUES (?, '', '1234567890', '')`;
            db.execute(insertQuery, [contractor_id], (err, insertResults) => {
                if (err) {
                    console.error("Database error:", err);
                    return res.status(500).json({ error: err.message });
                }

                const newProfile = {
                    profile_id: insertResults.insertId,
                    contractor_id: contractor_id,
                    bio: '',
                    phone_number: '',
                    role_status: ''
                };

                res.status(201).json(newProfile);
            });
        } else {
            const profile = results[0];
            res.status(200).json(profile);
        }
    });
});
router.put("/:contractor_id", async (req, res) => {
  const { contractor_id } = req.params;
  const { bio, phone_number, role_status } = req.body;

  const query = `
    UPDATE profile
    SET bio = ?, phone_number = ?, role_status = ?
    WHERE contractor_id = ?
  `;

  db.execute(query, [bio, phone_number, "", contractor_id], (err, results) => {
    if (err) {
      console.error("Error updating profile:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "Profile not found" });
    }

    // Fetch the updated profile
    db.execute(`SELECT * FROM profile WHERE contractor_id = ?`, [contractor_id], (err, results) => {
      if (err) {
        console.error("Error fetching updated profile:", err);
        return res.status(500).json({ error: "Database error" });
      }

      const updatedProfile = results[0];
      res.status(200).json(updatedProfile);
    });
  });
});

router.get("/skills/:contractor_id", async (req, res) => {
  const { contractor_id } = req.params;
  const query = `
    SELECT 
      c.contractor_id,
      c.name,
      c.email,
      p.bio,
      p.phone_number,
      p.role_status,
      s.skills,
      s.experience,
      s.education
    FROM 
      contractor c
    JOIN 
      profile p ON c.contractor_id = p.contractor_id
    JOIN 
      skills s ON p.profile_id = s.profile_id
    WHERE 
      c.contractor_id = ?;
  `;

  db.execute(query, [contractor_id], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: err.message });
    }

    if (results.length === 0) {
       // Skills not found, create a default skills entry
      const insertQuery = `
        INSERT INTO skills (profile_id, skills, experience, education) 
        VALUES ((SELECT profile_id FROM profile WHERE contractor_id = ?), '', '', '')
      `;
      db.execute(insertQuery, [contractor_id], (err, insertResults) => {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json({ error: err.message });
        }

        const newSkills = {
          skills_id: insertResults.insertId,
          contractor_id: contractor_id,
          skills: '',
          experience: '',
          education: ''
        };

        res.status(201).json(newSkills);
      });
    } else {
      const skills = results[0];
      res.status(200).json(skills);
    }
  });
});

router.put("/skills/:contractor_id", async (req, res) => {
  const { contractor_id } = req.params;
  const { skills, experience, education } = req.body;

  const query = `
    UPDATE skills s
    JOIN profile p ON s.profile_id = p.profile_id
    SET s.skills = ?, s.experience = ?, s.education = ?
    WHERE p.contractor_id = ?;
  `;

  db.execute(query, [skills, experience, education, contractor_id], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: err.message });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "Skills not found for the contractor" });
    }

    db.execute(`SELECT * FROM skills s
                JOIN profile p ON s.profile_id = p.profile_id
                WHERE p.contractor_id = ?`, [contractor_id], (err, results) => {
      if (err) {
        console.error("Error fetching updated skills:", err);
        return res.status(500).json({ error: "Database error" });
      }

      const updatedSkills = results[0];
      res.status(200).json(updatedSkills);
    });
  });
});

router.get('/listings/:userId', (req, res) => {
  const { userId } = req.params;
  const query = 'SELECT * FROM job WHERE client_id = ?';

  db.execute(query, [userId], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: err.message });
    }
    const formattedResults = results.map(job => ({
      ...job,
      date_posted: new Date(parseInt(job.date_posted)).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }));


    res.status(200).json(formattedResults);
  });
});


module.exports = router;