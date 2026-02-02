module.exports = (req, res, next) => {
  if (req.adminRole !== 2) {
    return res.status(403).json({
      message: "Super Admin access required"
    });
  }
  next();
};
