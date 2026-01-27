module.exports = (req, res, next) => {
  const adminHeader = req.headers["x-admin"];

  if (!adminHeader) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    req.admin = JSON.parse(adminHeader);
    next();
  } catch (err) {
    return res.status(400).json({ message: "Invalid admin header" });
  }
};
