const db = require("../db");
const bcrypt = require("bcryptjs");

/* =========================
   ADMIN LOGIN
========================= */
exports.adminLogin = (req, res) => {
  const { email, password } = req.body;

  const sql = `
    SELECT uid, user_name, email, password, isAdmin
    FROM users
    WHERE email = ? AND isAdmin > 0 AND is_deleted = 0
  `;

  db.query(sql, [email], async (err, result) => {
    if (err) return res.status(500).json({ message: "Database error" });
    if (result.length === 0)
      return res.status(401).json({ message: "Admin not found" });

    const admin = result[0];
    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch)
      return res.status(401).json({ message: "Invalid password" });

    res.json({
      message: "Admin login successful",
      admin: {
        uid: admin.uid,
        name: admin.user_name,
        email: admin.email,
        isAdmin: admin.isAdmin
      }
    });
  });
};

/* =========================
   DASHBOARD STATS
========================= */
exports.getDashboardStats = (req, res) => {
  const sql = `
  SELECT
    COUNT(*) AS totalUsers,
    SUM(is_banned = 1) AS bannedUsers,
    SUM(isAdmin > 0 AND is_banned = 0) AS adminUsers
  FROM users
  WHERE is_deleted = 0
`;


  db.query(sql, (err, result) => {
    if (err) {
      console.error("Dashboard error:", err);
      return res.status(500).json({ message: "Database error" });
    }

    const stats = result[0] || {
      totalUsers: 0,
      bannedUsers: 0,
      adminUsers: 0
    };

    stats.activeUsers = stats.totalUsers - stats.bannedUsers;

    res.json(stats);
  });
};


/* =========================
   GET USERS
========================= */
exports.getAllUsers = (req, res) => {
  const sql = `
    SELECT uid, user_name, email, isAdmin, is_banned
    FROM users
    WHERE is_deleted = 0
  `;

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ message: "Database error" });
    res.json(result);
  });
};

/* =========================
   BAN / UNBAN USER
========================= */
exports.toggleBanUser = (req, res) => {
  const { uid, ban } = req.body;

  // Step 1: Get role of user
  const checkSql = "SELECT isAdmin FROM users WHERE uid = ?";

  db.query(checkSql, [uid], (err, result) => {
    if (err || !result.length) {
      return res.status(500).json({ message: "User not found" });
    }

    // ❌ Super Admin can never be banned
    if (result[0].isAdmin === 2) {
      return res.status(403).json({
        message: "Super Admin cannot be banned"
      });
    }

    // Step 2: If banning → remove admin role
    let sql;
    let params;

    if (ban === 1) {
      sql = `
        UPDATE users
        SET is_banned = 1,
            isAdmin = 0
        WHERE uid = ?
      `;
      params = [uid];
    } else {
      sql = `
        UPDATE users
        SET is_banned = 0
        WHERE uid = ?
      `;
      params = [uid];
    }

    db.query(sql, params, err => {
      if (err) {
        return res.status(500).json({ message: "Update failed" });
      }
      res.json({ message: "User updated successfully" });
    });
  });
};


/* =========================
   MAKE ADMIN
========================= */
exports.makeAdmin = (req, res) => {
  const { uid } = req.body;

  db.query(
    "UPDATE users SET isAdmin = 1 WHERE uid = ? AND isAdmin = 0",
    [uid],
    err => {
      if (err) return res.status(500).json({ message: "Database error" });
      res.json({ message: "User promoted to Admin" });
    }
  );
};

/* =========================
   REMOVE ADMIN
========================= */
exports.removeAdmin = (req, res) => {
  const { uid } = req.body;

  db.query(
    "UPDATE users SET isAdmin = 0 WHERE uid = ? AND isAdmin = 1",
    [uid],
    err => {
      if (err) return res.status(500).json({ message: "Database error" });
      res.json({ message: "Admin removed" });
    }
  );
};

/* =========================
   SEARCH USERS
========================= */
exports.searchUsers = (req, res) => {
  const q = req.query.q || "";

  const sql = `
    SELECT uid, user_name, email, isAdmin, is_banned
    FROM users
    WHERE is_deleted = 0
    AND (user_name LIKE ? OR email LIKE ?)
  `;

  db.query(sql, [`%${q}%`, `%${q}%`], (err, result) => {
    if (err) return res.status(500).json({ message: "Database error" });
    res.json(result);
  });
};

/* =========================
   LOOKUPS (SUPER ADMIN)
========================= */
exports.getLookupData = (req, res) => {
  const { type } = req.params;

  const allowedTables = [
    "religion",
    "education",
    "dietary",
    "drinking",
    "smoking",
    "workout",
    "language",
    "interest",
    "lookingfor",
    "opento",
    "lovestyle",
    "personalitytype",
    "pet",
    "zodiac",
    "jobindustry",
    "communicationstyle",
    "familyplans",
    "subscriptiondetails",
    "reportreason"
  ];

  if (!allowedTables.includes(type)) {
    return res.status(400).json({ message: "Invalid lookup type" });
  }

  db.query(
    `SELECT * FROM ${type} WHERE active = 1`,
    (err, result) => {
      if (err) return res.status(500).json({ message: "Database error" });
      res.json(result);
    }
  );
};
/* =========================
   GET LOOKUP TABLE DATA
========================= */
exports.getLookupTable = (req, res) => {
  const table = req.params.table;

  // ✅ allow only safe lookup tables
  const allowedTables = [
    "religion",
    "education",
    "smoking",
    "drinking",
    "workout",
    "zodiac"
  ];

  if (!allowedTables.includes(table)) {
    return res.status(400).json({ message: "Invalid lookup table" });
  }

  const sql = `
    SELECT 
      ${table}_id AS id,
      type_code,
      name,
      active
    FROM ${table}
    ORDER BY id ASC
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error("Lookup SQL error:", err);
      return res.status(500).json({ message: "Database error" });
    }

    res.json(result);
  });
};
exports.getFeedback = (req, res) => {
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
