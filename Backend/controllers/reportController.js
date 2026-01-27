const db = require("../db");

/* =========================
   GET ALL REPORTS
========================= */
exports.getAllReports = (req, res) => {
  const sql = `
    SELECT
      r.report_id,
      u.email AS reported_user,
      COALESCE(rr.name, r.reason_custom) AS reason,
      r.status,
      r.timestamp
    FROM report r
    LEFT JOIN users u ON u.uid = r.reported_id
    LEFT JOIN reportreason rr ON rr.reason_id = r.reason_id
    ORDER BY r.timestamp DESC
  `;

  db.query(sql, (err, rows) => {
    if (err) {
      console.error("Reports SQL error:", err);
      return res.status(500).json({ message: "Database error" });
    }

    res.json(rows);
  });
};
