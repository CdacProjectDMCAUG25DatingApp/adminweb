const db = require("../db");

function adminAuth(req, res, next) {
  const adminHeader = req.headers["x-admin"];

  if (!adminHeader) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  let admin;
  try {
    admin = JSON.parse(adminHeader);
  } catch {
    return res.status(401).json({ message: "Invalid admin data" });
  }

  const adminId = admin.uid || admin.admin?.uid;

  if (!adminId) {
    return res.status(401).json({ message: "Admin ID missing" });
  }

  const sql = "SELECT isAdmin FROM users WHERE uid = ? AND is_deleted = 0";

  db.query(sql, [adminId], (err, result) => {
    if (err || result.length === 0) {
      return res.status(403).json({ message: "Access denied" });
    }

    req.adminRole = result[0].isAdmin;
    req.admin = admin;
    next();
  });
}

module.exports = adminAuth;
