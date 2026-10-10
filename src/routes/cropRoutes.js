
const express = require("express");
const Crop = require("../models/Crop");
const {
  createContentEngagementHandlers,
} = require("../controllers/contentEngagementController");

const {
  getCrops,
  getCropById,
  getCropBySlug,
  getCropQuestions,
  createCropQuestion,
  getAdminCropQuestions,
  answerCropQuestion,
  deleteCropQuestion,
  createCrop,
  updateCrop,
  deleteCrop,
  updateCropStatus,
  updateCropFeatured,
} = require("../controllers/cropController");

const {
  cropValidation,
} = require("../validators/cropValidator");

const validate = require("../middleware/validate");

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

const router = express.Router();
const cropEngagement = createContentEngagementHandlers(Crop, "crop");

// Public APIs
router.get("/", getCrops);
router.post("/:id/view", cropEngagement.recordView);
router.put("/:id/like", cropEngagement.setLike);
router.delete("/:id/like", cropEngagement.setLike);
router.get("/admin/questions", protect, adminOnly, getAdminCropQuestions);
router.patch("/admin/questions/:id/answer", protect, adminOnly, answerCropQuestion);
router.delete("/admin/questions/:id", protect, adminOnly, deleteCropQuestion);
router.get("/slug/:slug/questions", getCropQuestions);
router.post("/slug/:slug/questions", createCropQuestion);
router.get("/slug/:slug", getCropBySlug);
router.get("/:id", getCropById);

// Admin-only APIs
router.post(
  "/",
  protect,
  adminOnly,
  cropValidation,
  validate,
  createCrop
);

router.patch(
  "/:id/status",
  protect,
  adminOnly,
  updateCropStatus
);

router.patch(
  "/:id/featured",
  protect,
  adminOnly,
  updateCropFeatured
);

router.patch(
  "/:id",
  protect,
  adminOnly,
  cropValidation,
  validate,
  updateCrop
);

router.delete(
  "/:id",
  protect,
  adminOnly,
  deleteCrop
);

module.exports = router;