const db = require("../db");

/* =========================
   LOOKUP TABLE MAP
========================= */
const LOOKUP_TABLES = {
  religion: "id",
  education: "id",
  dietary: "id",
  drinking: "id",
  smoking: "id",
  workout: "id",
  language: "id",
  interest: "id",
  lookingfor: "id",
  opento: "id",
  lovestyle: "id",
  personalitytype: "id",
  pet: "id",
  zodiac: "id",
  jobindustry: "id",
  communicationstyle: "id",
  familyplans: "id",
  sleepinghabit: "id",
  subscriptiondetails: "id",
  reportreason: "id",
  gender: "id"
};

/* =================================================
   GET LOOKUP DATA (ADMIN + SUPER ADMIN)
================================================= */
exports.getLookupData = (req, res) => {
  const table = req.params.table;

  if (!LOOKUP_TABLES[table]) {
    return res.status(400).json({ message: "Invalid lookup table" });
  }

  const idColumn = LOOKUP_TABLES[table];

  const sql = `
    SELECT 
      ${idColumn} AS id,
      type_code,
      name,
      active
    FROM ${table}
    ORDER BY name ASC
  `;

  db.query(sql, (err, rows) => {
    if (err) {
      console.error("Lookup fetch error:", err);
      return res.status(500).json({ message: "Database error" });
    }
    res.json(rows);
  });
};

/* =================================================
   ADD LOOKUP (SUPER ADMIN ONLY)
================================================= */
exports.addLookup = (req, res) => {
  if (req.adminRole !== 2) {
    return res.status(403).json({ message: "Super Admin only" });
  }

  const { table, type_code, name, description } = req.body;

  if (!LOOKUP_TABLES[table]) {
    return res.status(400).json({ message: "Invalid lookup table" });
  }

  if (!name || !type_code) {
    return res.status(400).json({ message: "Missing fields" });
  }

  const sql = `
    INSERT INTO ${table} (type_code, name, description, active)
    VALUES (?, ?, ?, 1)
  `;

  db.query(sql, [type_code, name, description || null], err => {
    if (err) {
      console.error("Lookup insert error:", err);
      return res.status(500).json({ message: "Insert failed" });
    }
    res.json({ message: "Lookup added successfully" });
  });
};

/* =================================================
   UPDATE LOOKUP (SUPER ADMIN ONLY)
================================================= */
exports.updateLookup = (req, res) => {
  if (req.adminRole !== 2) {
    return res.status(403).json({ message: "Super Admin only" });
  }

  const { table, id, type_code, name } = req.body;

  if (!LOOKUP_TABLES[table]) {
    return res.status(400).json({ message: "Invalid lookup table" });
  }

  const idColumn = LOOKUP_TABLES[table];

  const sql = `
    UPDATE ${table}
    SET type_code = ?, name = ?
    WHERE ${idColumn} = ?
  `;

  db.query(sql, [type_code, name, id], err => {
    if (err) {
      console.error("Lookup update error:", err);
      return res.status(500).json({ message: "Update failed" });
    }
    res.json({ message: "Lookup updated successfully" });
  });
};

/* =================================================
   TOGGLE ACTIVE / INACTIVE (SUPER ADMIN ONLY)
================================================= */
exports.toggleLookupStatus = (req, res) => {
  if (req.adminRole !== 2) {
    return res.status(403).json({ message: "Super Admin only" });
  }

  const { table, id } = req.body;

  if (!LOOKUP_TABLES[table]) {
    return res.status(400).json({ message: "Invalid lookup table" });
  }

  const idColumn = LOOKUP_TABLES[table];

  const sql = `
    UPDATE ${table}
    SET active = IF(active = 1, 0, 1)
    WHERE ${idColumn} = ?
  `;

  db.query(sql, [id], err => {
    if (err) {
      console.error("Lookup toggle error:", err);
      return res.status(500).json({ message: "Status update failed" });
    }
    res.json({ message: "Status updated successfully" });
  });
};
/* =========================
   GET LOOKUP TYPES
========================= */
exports.getLookupTypes = (req, res) => {
  res.json(Object.keys(LOOKUP_TABLES));
};
/* =========================
   DELETE LOOKUP (HARD DELETE)
========================= */
exports.deleteLookup = (req, res) => {
  const { table, id } = req.body;

  if (!LOOKUP_TABLES[table]) {
    return res.status(400).json({ message: "Invalid lookup table" });
  }

  const idColumn = LOOKUP_TABLES[table];

  const sql = `
    DELETE FROM ${table}
    WHERE ${idColumn} = ?
  `;

  db.query(sql, [id], err => {
    if (err) {
      console.error("Lookup delete error:", err);
      return res.status(500).json({ message: "Delete failed" });
    }

    res.json({ message: "Lookup deleted" });
  });
};
/* =========================
   DELETE LOOKUP (SOFT)
========================= */
exports.deleteLookup = (req, res) => {
  const { table, id } = req.body;

  if (!LOOKUP_TABLES[table]) {
    return res.status(400).json({ message: "Invalid lookup table" });
  }

  const idColumn = LOOKUP_TABLES[table];

  const sql = `
    UPDATE ${table}
    SET active = 0
    WHERE ${idColumn} = ?
  `;

  db.query(sql, [id], err => {
    if (err) {
      console.error("Lookup delete error:", err);
      return res.status(500).json({ message: "Delete failed" });
    }
    res.json({ message: "Lookup deleted" });
  });
};
// adminController or lookupController
exports.getLookupTables = (req, res) => {
  res.json([
    "religion",
    "education",
    "language",
    "gender",
    "zodiac",
    "smoking",
    "drinking",
    "dietary",
    "workout",
    "sleepinghabit",
    "pet",
    "lovestyle",
    "personalitytype",
    "communicationstyle",
    "lookingfor",
    "opento",
    "familyplans",
    "jobindustry",
    "interest",
    "subscriptiondetails",
    "reportreason"
  ]);
};
