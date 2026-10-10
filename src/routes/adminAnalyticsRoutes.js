const express = require("express");
const { getContentAnalytics } = require("../controllers/adminAnalyticsController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/analytics", protect, adminOnly, getContentAnalytics);

module.exports = router;
