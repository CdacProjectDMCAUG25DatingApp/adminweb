const jwt = require("jsonwebtoken");
const db = require("../db");
const config = require("../config");

module.exports = (req, res, next) => {
  const token = req.headers.token;

  if (!token) {
    return res.status(401).json({ message: "Token missing" });
  }

  try {
    const payload = jwt.verify(token, config.SECRET);
    const uid = payload.uid;

    const sql = "SELECT isAdmin FROM users WHERE uid = ? AND is_deleted = 0";

    db.query(sql, [uid], (err, rows) => {
      if (err || rows.length === 0) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      req.adminUid = uid;
      req.adminRole = rows[0].isAdmin; // gives 1 or 2
      next();
    });
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
