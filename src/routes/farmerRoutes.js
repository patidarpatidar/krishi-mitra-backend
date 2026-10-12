const express = require("express");
const router = express.Router();

const {
  getProfile,
  updateProfile,
  getCrops,
  addCrop,
  updateCrop,
  deleteCrop,
  getCropExpenses,
  addCropExpense,
  updateCropExpense,
  deleteCropExpense,
  getSavedItems,
  addSavedItem,
  deleteSavedItem,
  getWatchlist,
  updateWatchlist,
  getDashboardOverview,
} = require("../controllers/farmerController");

const { protect } = require("../middleware/authMiddleware");

// All farmer routes require authentication
router.use(protect);

router.get("/profile", getProfile);
router.put("/profile", updateProfile);

router.get("/dashboard", getDashboardOverview);

router.get("/crops", getCrops);
router.post("/crops", addCrop);
router.patch("/crops/:id", updateCrop);
router.delete("/crops/:id", deleteCrop);
router.get("/crops/:id/expenses", getCropExpenses);
router.post("/crops/:id/expenses", addCropExpense);
router.patch("/crops/:id/expenses/:expenseId", updateCropExpense);
router.delete("/crops/:id/expenses/:expenseId", deleteCropExpense);

router.get("/saved", getSavedItems);
router.post("/saved", addSavedItem);
router.delete("/saved/:id", deleteSavedItem);

router.get("/watchlist", getWatchlist);
router.post("/watchlist", updateWatchlist);

module.exports = router;
