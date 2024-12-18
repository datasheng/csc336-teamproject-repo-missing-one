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
    
    // First, verify that the contractor exists
    const checkContractorQuery = `SELECT contractor_id FROM contractor WHERE contractor_id = ?`;
    
    db.execute(checkContractorQuery, [contractor_id], (checkErr, checkResults) => {
        if (checkErr) {
            console.error("Database error:", checkErr);
            return res.status(500).json({ error: checkErr.message });
        }

        // If contractor doesn't exist, return error
        if (checkResults.length === 0) {
            return res.status(404).json({ error: "Contractor not found" });
        }

        // If contractor exists, proceed with profile check/creation
        const query = `SELECT * FROM profile WHERE contractor_id = ?`;

        db.execute(query, [contractor_id], (err, results) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ error: err.message });
            }

            if (results.length === 0) {
                // Profile not found, create a default profile
                const insertQuery = `
                    INSERT INTO profile (
                        contractor_id, 
                        bio, 
                        phone_number, 
                        role_status
                    ) VALUES (?, '', NULL, 'Looking for Work')`;
                    
                db.execute(insertQuery, [contractor_id], (insertErr, insertResults) => {
                    if (insertErr) {
                        console.error("Database error:", insertErr);
                        return res.status(500).json({ error: insertErr.message });
                    }

                    // After creating profile, return it immediately
                    const newProfile = {
                        profile_id: insertResults.insertId,
                        contractor_id: contractor_id,
                        bio: '',
                        phone_number: null,
                        role_status: 'Looking for Work'
                    };

                    res.status(201).json(newProfile);
                });
            } else {
                const profile = results[0];
                res.status(200).json(profile);
            }
        });
    });
});
router.put("/:contractor_id", async (req, res) => {
  const { contractor_id } = req.params;
  const { bio, phone_number, role_status, education } = req.body;

  try {
    // Get current profile data
    const [currentProfile] = await db.promise().query(
      'SELECT * FROM profile WHERE contractor_id = ?',
      [contractor_id]
    );

    if (currentProfile.length === 0) {
      return res.status(404).json({ error: "Profile not found" });
    }

    // Use existing values if new ones aren't provided
    const updatedProfile = {
      bio: bio ?? currentProfile[0].bio,
      phone_number: phone_number ?? currentProfile[0].phone_number,
      role_status: role_status ?? currentProfile[0].role_status,
      education: education ?? currentProfile[0].education
    };

    const query = `
      UPDATE profile
      SET bio = ?,
          phone_number = ?,
          role_status = ?,
          education = ?
      WHERE contractor_id = ?
    `;

    await db.promise().query(query, [
      updatedProfile.bio,
      updatedProfile.phone_number,
      updatedProfile.role_status,
      updatedProfile.education,
      contractor_id
    ]);

    // Fetch and return the updated profile
    const [updatedData] = await db.promise().query(
      'SELECT * FROM profile WHERE contractor_id = ?',
      [contractor_id]
    );

    res.status(200).json(updatedData[0]);
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

// Update skills endpoint
router.put("/skills/:contractor_id", async (req, res) => {
  const { contractor_id } = req.params;
  const { skills } = req.body;

  try {
    // First get the profile_id
    const [profileRows] = await db.promise().query(
      'SELECT profile_id FROM profile WHERE contractor_id = ?',
      [contractor_id]
    );

    if (profileRows.length === 0) {
      return res.status(404).json({ error: "Profile not found" });
    }

    const profile_id = profileRows[0].profile_id;

    // Delete existing skills
    await db.promise().query(
      'DELETE FROM skills WHERE profile_id = ?',
      [profile_id]
    );

    // Insert new skills if any
    if (skills && skills.length > 0) {
      const skillValues = skills
        .filter(skill => skill && skill.skill_name && skill.skill_name.trim() !== '')
        .map(skill => [profile_id, skill.skill_name.trim()]);

      if (skillValues.length > 0) {
        await db.promise().query(
          'INSERT INTO skills (profile_id, skill_name) VALUES ?',
          [skillValues]
        );
      }
    }

    // Fetch updated skills
    const [updatedSkills] = await db.promise().query(
      'SELECT skill_name FROM skills WHERE profile_id = ?',
      [profile_id]
    );

    // Format the response to match the expected structure
    const formattedSkills = updatedSkills.map(skill => ({
      skill_name: skill.skill_name
    }));

    res.status(200).json({
      message: "Skills updated successfully",
      skills: formattedSkills
    });

  } catch (error) {
    console.error("Error in PUT /skills/:contractor_id:", error);
    res.status(500).json({ 
      error: "Failed to update skills",
      details: error.message 
    });
  }
});

// Get skills endpoint
router.get("/skills/:contractor_id", async (req, res) => {
  const { contractor_id } = req.params;

  try {
    // First get the profile_id and education from profile table
    const [profileRows] = await db.promise().query(
      'SELECT profile_id, education FROM profile WHERE contractor_id = ?',
      [contractor_id]
    );

    if (profileRows.length === 0) {
      return res.status(404).json({ error: "Profile not found" });
    }

    const profile_id = profileRows[0].profile_id;
    const education = profileRows[0].education;

    // Get skills (without education since it's in profile table)
    const [skillRows] = await db.promise().query(
      'SELECT skill_name FROM skills WHERE profile_id = ?',
      [profile_id]
    );

    // Format the response
    const formattedSkills = skillRows.map(skill => ({
      skill_name: skill.skill_name
    }));

    res.status(200).json({
      skills: formattedSkills,
      education: education || ''
    });

  } catch (error) {
    console.error("Error in GET /skills/:contractor_id:", error);
    res.status(500).json({ 
      error: "Failed to fetch skills",
      details: error.message 
    });
  }
});

// Get experiences endpoint
router.get("/experiences/:contractor_id", async (req, res) => {
  const { contractor_id } = req.params;

  try {
    // First get the profile_id
    const [profileRows] = await db.promise().query(
      'SELECT profile_id FROM profile WHERE contractor_id = ?',
      [contractor_id]
    );

    if (profileRows.length === 0) {
      return res.status(404).json({ error: "Profile not found" });
    }

    const profile_id = profileRows[0].profile_id;

    // Get experiences
    const [experiences] = await db.promise().query(
      'SELECT * FROM experiences WHERE profile_id = ? ORDER BY start_date DESC',
      [profile_id]
    );

    res.status(200).json({ experiences });

  } catch (error) {
    console.error("Error in GET /experiences/:contractor_id:", error);
    res.status(500).json({ 
      error: "Failed to fetch experiences",
      details: error.message 
    });
  }
});

// Update experiences endpoint
router.put("/experiences/:contractor_id", async (req, res) => {
  const { contractor_id } = req.params;
  const { experiences } = req.body;

  try {
    console.log('Updating experiences for contractor_id:', contractor_id);
    console.log('Received experiences:', experiences);

    // First get the profile_id
    const [profileRows] = await db.promise().query(
      'SELECT profile_id FROM profile WHERE contractor_id = ?',
      [contractor_id]
    );

    if (profileRows.length === 0) {
      return res.status(404).json({ error: "Profile not found" });
    }

    const profile_id = profileRows[0].profile_id;
    console.log('Found profile_id:', profile_id);

    // Delete existing experiences
    const [deleteResult] = await db.promise().query(
      'DELETE FROM experiences WHERE profile_id = ?',
      [profile_id]
    );
    console.log('Delete result:', deleteResult);

    // Insert new experiences if any
    if (experiences && experiences.length > 0) {
      const experienceValues = experiences
        .filter(exp => exp.company_name && exp.role_title)
        .map(exp => [
          profile_id,
          exp.company_name.trim(),
          exp.role_title.trim(),
          exp.start_date ? new Date(exp.start_date) : null,
          exp.end_date ? new Date(exp.end_date) : null,
          exp.description ? exp.description.trim() : null
        ]);

      console.log('Formatted experience values:', experienceValues);

      if (experienceValues.length > 0) {
        const insertQuery = `
          INSERT INTO experiences (
            profile_id, 
            company_name, 
            role_title, 
            start_date, 
            end_date, 
            description
          ) VALUES ?
        `;
        
        const [insertResult] = await db.promise().query(insertQuery, [experienceValues]);
        console.log('Insert result:', insertResult);
      }
    }

    // Fetch updated experiences
    const [updatedExperiences] = await db.promise().query(
      'SELECT * FROM experiences WHERE profile_id = ? ORDER BY start_date DESC',
      [profile_id]
    );

    console.log('Updated experiences:', updatedExperiences);

    res.status(200).json({
      message: "Experiences updated successfully",
      experiences: updatedExperiences
    });

  } catch (error) {
    console.error("Error in PUT /experiences/:contractor_id:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      code: error.code,
      sqlMessage: error.sqlMessage
    });
    
    res.status(500).json({ 
      error: "Failed to update experiences",
      details: error.message,
      sqlMessage: error.sqlMessage
    });
  }
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
      date_posted: new Date(job.date_posted).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }));

    res.status(200).json(formattedResults);
  });
});


router.get("/client/:client_id", async (req, res) => {
  const { client_id } = req.params;
  const query = `SELECT client_id, name, email, company, location, isHiring FROM client WHERE client_id = ?`;

  try {
    const [results] = await db.promise().query(query, [client_id]);

    if (results.length === 0) {
      return res.status(404).json({ error: "Client not found" });
    }

    console.log("Client data fetched:", results[0]); // Debug log
    res.status(200).json(results[0]);
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: err.message });
  }
});

router.put("/client/:client_id", async (req, res) => {
    const { client_id } = req.params;
    const { company, location, isHiring } = req.body;

    const query = `
      UPDATE client
      SET company = ?, location = ?, isHiring = ?
      WHERE client_id = ?
    `;

    db.execute(query, [company, location, isHiring, client_id], (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: err.message });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ error: "Client not found" });
        }

        db.execute(`SELECT * FROM client WHERE client_id = ?`, [client_id], (err, results) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ error: err.message });
            }

            const updatedClient = results[0];
            res.status(200).json(updatedClient);
        });
    });
});

module.exports = router;