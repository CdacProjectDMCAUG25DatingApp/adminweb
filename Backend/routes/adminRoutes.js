const express = require("express");
const router = express.Router();

const adminController = require("../controllers/adminController");
const lookupController = require("../controllers/lookupController");
const reportController = require("../controllers/reportController"); // ✅ REQUIRED
const adminAuth = require("../middleware/authMiddleware");

/* AUTH */
router.post("/login", adminController.adminLogin);

/* DASHBOARD */
router.get("/dashboard-stats", adminAuth, adminController.getDashboardStats);

/* USERS */
router.get("/users", adminAuth, adminController.getAllUsers);
router.get("/users/search", adminAuth, adminController.searchUsers);
router.post("/ban-user", adminAuth, adminController.toggleBanUser);
router.post("/make-admin", adminAuth, adminController.makeAdmin);
router.post("/remove-admin", adminAuth, adminController.removeAdmin);

/* LOOKUPS */
router.get("/lookups/:table", adminAuth, lookupController.getLookupData);
router.post("/lookups/add", adminAuth, lookupController.addLookup);
router.post("/lookups/update", adminAuth, lookupController.updateLookup);
router.post("/lookups/toggle", adminAuth, lookupController.toggleLookupStatus);

/* FEEDBACK ✅ */
router.get("/feedback", adminAuth, adminController.getFeedback);

/* REPORTS ✅ */
router.get("/reports", adminAuth, reportController.getAllReports);

module.exports = router;
