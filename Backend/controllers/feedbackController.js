const db = require("../db");

/* =========================
   GET ALL FEEDBACK
========================= */
exports.getAllFeedback = (req, res) => {
  const sql = `
    SELECT 
      f.feedback_id,
      f.subject,
      f.details,
      f.status,
      f.timestamp,
      u.user_name
    FROM feedback f
    LEFT JOIN users u ON u.uid = f.user_id
    ORDER BY f.timestamp DESC
  `;

  db.query(sql, (err, rows) => {
    if (err) {
      console.error("Feedback error:", err);
      return res.status(500).json({ message: "Failed to load feedback" });
    }
    res.json(rows);
  });
};
