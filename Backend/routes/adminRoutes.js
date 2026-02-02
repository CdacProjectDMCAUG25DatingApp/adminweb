const express = require("express");
const router = express.Router();

const adminController = require("../controllers/adminController");
const lookupController = require("../controllers/lookupController");
const reportController = require("../controllers/reportController");

const adminAuth = require("../middleware/adminAuth");
const superAdmin = require("../middleware/superAdminAuth");

/* AUTH */
router.post("/login", adminController.adminLogin);

/* DASHBOARD */
router.get("/dashboard-stats", adminAuth, adminController.getDashboardStats);

/* USERS */
router.get("/users", adminAuth, adminController.getAllUsers);
router.get("/users/search", adminAuth, adminController.searchUsers);
router.post("/ban-user", adminAuth, adminController.toggleBanUser);
router.post("/make-admin", superAdmin, adminController.makeAdmin);
router.post("/remove-admin", superAdmin, adminController.removeAdmin);

/* LOOKUPS (super admin only) */
router.get("/lookups/:table", adminAuth, lookupController.getLookupData);
router.post("/lookups/add", superAdmin, lookupController.addLookup);
router.post("/lookups/update", superAdmin, lookupController.updateLookup);
router.post("/lookups/toggle", superAdmin, lookupController.toggleLookupStatus);

/* FEEDBACK */
router.get("/feedback", adminAuth, adminController.getFeedback);

/* REPORTS */
router.get("/reports", adminAuth, reportController.getAllReports);
router.post("/reports/review", adminAuth, reportController.markInReview);
router.post("/reports/resolve", adminAuth, reportController.markResolved);
router.get("/reports/user/:uid", adminAuth, reportController.getUserModerationProfile);

module.exports = router;
