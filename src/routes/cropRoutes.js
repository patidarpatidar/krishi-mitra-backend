
const express = require("express");

const {
  getCrops,
  getCropById,
  getCropBySlug,
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

// Public APIs
router.get("/", getCrops);
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