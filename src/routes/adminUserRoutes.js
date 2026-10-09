const express = require("express");
const router = express.Router();

const {
  getFarmers,
  toggleFarmerStatus,
  deleteFarmer,
} = require("../controllers/adminUserController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

// All admin farmers routes require admin login
router.use(protect, adminOnly);

router.get("/", getFarmers);
router.patch("/:id/status", toggleFarmerStatus);
router.delete("/:id", deleteFarmer);

module.exports = router;
