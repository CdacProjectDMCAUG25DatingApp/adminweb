module.exports = (req, res, next) => {
  const adminHeader = req.headers["x-admin"];

  if (!adminHeader) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const admin = JSON.parse(adminHeader);

    if (admin.isAdmin !== 2) {
      return res.status(403).json({
        message: "Super Admin access required"
      });
    }

    req.admin = admin;
    next();
  } catch {
    return res.status(400).json({ message: "Invalid admin header" });
  }
};
