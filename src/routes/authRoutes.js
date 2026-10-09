
const express = require("express");
const router = express.Router();

const {
  register,
  login,
  me,
  updateProfile,
  logout,
  adminLogin
} = require("../controllers/authController");

const {
  protect,
} = require("../middleware/authMiddleware");

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, me);
router.put("/profile", protect, updateProfile);
router.post("/logout", protect, logout);
router.post("/admin/login", adminLogin);
module.exports = router;