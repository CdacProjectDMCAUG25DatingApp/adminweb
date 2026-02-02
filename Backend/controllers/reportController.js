const db = require("../db");

/* ===========================================================
   GET ALL REPORTS WITH FULL INFO
=========================================================== */
exports.getAllReports = (req, res) => {
  const sql = `
    SELECT
      r.report_id,
      r.status,
      r.timestamp,

      /* Reporter */
      reporter.uid AS reporter_uid,
      reporter.user_name AS reporter_name,
      reporter.email AS reporter_email,

      /* Reported */
      reported.uid AS reported_uid,
      reported.user_name AS reported_name,
      reported.email AS reported_email,

      /* Reason */
      rr.reason_id,
      rr.type_code AS reason_code,
      rr.name AS reason_name,
      rr.description AS reason_description,

      /* Fallback for custom reason */
      COALESCE(rr.name, r.reason_custom) AS final_reason

    FROM report r
    LEFT JOIN users reporter  ON reporter.uid = r.reporter_id
    LEFT JOIN users reported  ON reported.uid = r.reported_id
    LEFT JOIN reportreason rr ON rr.reason_id = r.reason_id
    ORDER BY r.timestamp DESC
  `;

  db.query(sql, (err, rows) => {
    if (err) {
      console.error("Report fetch error:", err);
      return res.status(500).json({ message: "Database error" });
    }
    res.json(rows);
  });
};

/* ===========================================================
   MARK AS IN REVIEW
=========================================================== */
exports.markInReview = (req, res) => {
  const { report_id } = req.body;

  if (!report_id)
    return res.status(400).json({ message: "Missing report_id" });

  const sql = `UPDATE report SET status = 'in_review' WHERE report_id = ?`;

  db.query(sql, [report_id], (err) => {
    if (err) {
      console.error("Mark in_review error:", err);
      return res.status(500).json({ message: "Database error" });
    }
    res.json({ message: "Report marked as In Review" });
  });
};

/* ===========================================================
   MARK AS RESOLVED
=========================================================== */
exports.markResolved = (req, res) => {
  const { report_id } = req.body;

  if (!report_id)
    return res.status(400).json({ message: "Missing report_id" });

  const sql = `UPDATE report SET status = 'resolved' WHERE report_id = ?`;

  db.query(sql, [report_id], (err) => {
    if (err) {
      console.error("Mark resolved error:", err);
      return res.status(500).json({ message: "Database error" });
    }
    res.json({ message: "Report marked as Resolved" });
  });
};

/* ===========================================================
   FULL USER MODERATION PROFILE
=========================================================== */
exports.getUserModerationProfile = (req, res) => {
  const uid = req.params.uid;

  const queries = {
    user: `
      SELECT uid, user_name, email, phone_number, isAdmin, is_banned,
             created_at, last_updated
      FROM users
      WHERE uid = ? AND is_deleted = 0
    `,

    profile: `
      SELECT *
      FROM userprofile
      WHERE uid = ? AND is_deleted = 0
    `,

    photos: `
      SELECT photo_url, is_primary, is_approved, uploaded_at
      FROM userphotos
      WHERE uid = ? AND is_deleted = 0
      ORDER BY is_primary DESC
    `,

    preferences: `
      SELECT *
      FROM userpreferences
      WHERE uid = ? AND is_deleted = 0
    `,

    blocked_by_user: `
      SELECT blocked_id AS uid, u.user_name, u.email, b.blocked_at
      FROM blockedusers b
      JOIN users u ON u.uid = b.blocked_id
      WHERE b.blocker_id = ? AND b.is_deleted = 0
    `,

    blocked_user: `
      SELECT blocker_id AS uid, u.user_name, u.email, b.blocked_at
      FROM blockedusers b
      JOIN users u ON u.uid = b.blocker_id
      WHERE b.blocked_id = ? AND b.is_deleted = 0
    `,

    swipes: `
      SELECT *
      FROM swipes
      WHERE swiper_user_id = ? OR swiped_user_id = ?
      ORDER BY created_at DESC
      LIMIT 50
    `,

    likes: `
      SELECT *
      FROM likes
      WHERE liker_user_id = ? OR liked_user_id = ?
      ORDER BY timestamp DESC
      LIMIT 50
    `,

    reports: `
      SELECT r.*, rr.name AS reason_name
      FROM report r
      LEFT JOIN reportreason rr ON rr.reason_id = r.reason_id
      WHERE r.reported_id = ?
      ORDER BY r.timestamp DESC
    `
  };

  const response = {};
  const keys = Object.keys(queries);
  let completed = 0;

  keys.forEach(key => {
    db.query(queries[key], [uid, uid], (err, result) => {
      if (err) {
        console.error("Profile fetch error:", err);
        return res.status(500).json({ message: "Database error" });
      }

      response[key] = result;
      completed++;

      if (completed === keys.length) {
        res.json(response);
      }
    });
  });
};
