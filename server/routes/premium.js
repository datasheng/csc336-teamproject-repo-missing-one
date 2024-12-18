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

// get premium status for a contractor
router.get("/:contractorId", (req, res) => {
  const { contractorId } = req.params;
  
  const query = `
    SELECT 
      premium_id,
      contractor_id,
      start_date,
      end_date,
      premium_status
    FROM profile_premium
    WHERE contractor_id = ?
    AND end_date >= CURDATE()
    ORDER BY end_date DESC
    LIMIT 1
  `;

  db.query(query, [contractorId], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Error fetching premium status" });
    }

    if (results.length === 0) {
      return res.json({ premium_status: 'regular' });
    }

    res.json(results[0]);
  });
});

// create or update premium subscription
router.post("/subscribe", (req, res) => {
  const { contractor_id, months = 1 } = req.body;

  const query = `
    INSERT INTO profile_premium (
      contractor_id,
      premium_status
    ) VALUES (
      ?,
      'premium'
    ) ON DUPLICATE KEY UPDATE
      premium_status = 'premium'
  `;

  db.query(query, [contractor_id], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Error creating premium subscription" });
    }

    // after creating/updating premium status, create payment record
    const paymentQuery = `
      INSERT INTO premium_payments (
        contractor_id,
        premium_id,
        amount,
        payment_status,
        subscription_start,
        subscription_end
      ) VALUES (
        ?,
        ?,
        35.00,
        'success',
        CURDATE(),
        DATE_ADD(CURDATE(), INTERVAL ? MONTH)
      )
    `;

    db.query(paymentQuery, [
      contractor_id, 
      result.insertId || result.updateId,
      months
    ], (err, paymentResult) => {
      if (err) {
        console.error("Payment error:", err);
        return res.status(500).json({ error: "Error creating payment record" });
      }

      res.json({
        message: "Premium subscription created successfully",
        premium_id: result.insertId || result.updateId,
        payment_id: paymentResult.insertId
      });
    });
  });
});

// Cancel premium subscription
router.post("/cancel/:contractorId", (req, res) => {
  const { contractorId } = req.params;

  const query = `
    UPDATE profile_premium
    SET premium_status = 'regular'
    WHERE contractor_id = ?
  `;

  db.query(query, [contractorId], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Error canceling premium subscription" });
    }

    // Update the end date of the current active subscription in premium_payments
    const updatePaymentQuery = `
      UPDATE premium_payments
      SET subscription_end = CURDATE()
      WHERE contractor_id = ?
      AND subscription_end > CURDATE()
      AND payment_status = 'success'
    `;

    db.query(updatePaymentQuery, [contractorId], (err, paymentResult) => {
      if (err) {
        console.error("Payment update error:", err);
        return res.status(500).json({ error: "Error updating payment record" });
      }

      res.json({ message: "Premium subscription canceled successfully" });
    });
  });
});

// Check if premium is active
router.get("/check/:contractorId", (req, res) => {
  const { contractorId } = req.params;

  const query = `
    SELECT EXISTS(
      SELECT 1
      FROM premium_payments pp
      JOIN profile_premium pr ON pp.premium_id = pr.premium_id
      WHERE pp.contractor_id = ?
      AND pr.premium_status = 'premium'
      AND CURDATE() BETWEEN pp.subscription_start AND pp.subscription_end
    ) as is_premium
  `;

  db.query(query, [contractorId], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Error checking premium status" });
    }

    res.json({ is_premium: results[0].is_premium === 1 });
  });
});

router.post("/process-payment", (req, res) => {
  const { contractor_id } = req.body;
  const amount = 35.00;
  
  db.beginTransaction(err => {
    if (err) {
      console.error("Transaction error:", err);
      return res.status(500).json({ error: "Error processing payment" });
    }

    // First, create or update premium status
    const premiumQuery = `
      INSERT INTO profile_premium (
        contractor_id,
        premium_status
      ) VALUES (
        ?,
        'premium'
      ) ON DUPLICATE KEY UPDATE
        premium_status = 'premium'
    `;

    db.query(premiumQuery, [contractor_id], (err, premiumResult) => {
      if (err) {
        return db.rollback(() => {
          console.error("Premium update error:", err);
          res.status(500).json({ error: "Error updating premium status" });
        });
      }

      // Then create payment record
      const paymentQuery = `
        INSERT INTO premium_payments (
          contractor_id,
          premium_id,
          amount,
          payment_status,
          subscription_start,
          subscription_end
        ) VALUES (
          ?,
          ?,
          ?,
          'success',
          CURDATE(),
          DATE_ADD(CURDATE(), INTERVAL 1 MONTH)
        )
      `;

      db.query(paymentQuery, [
        contractor_id, 
        premiumResult.insertId || premiumResult.updateId,
        amount
      ], (err, paymentResult) => {
        if (err) {
          return db.rollback(() => {
            console.error("Payment error:", err);
            res.status(500).json({ error: "Error processing payment" });
          });
        }

        db.commit(err => {
          if (err) {
            return db.rollback(() => {
              console.error("Commit error:", err);
              res.status(500).json({ error: "Error finalizing payment" });
            });
          }

          res.json({
            message: "Payment processed and premium activated successfully",
            payment_id: paymentResult.insertId,
            premium_id: premiumResult.insertId || premiumResult.updateId,
            amount: amount,
            subscription_start: new Date(),
            subscription_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          });
        });
      });
    });
  });
});

module.exports = router; 