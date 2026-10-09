
const express = require("express");

const {
  getSchemes,
  getSchemeById,
  getSchemeBySlug,
  createScheme,
  updateScheme,
  deleteScheme,
  updateSchemeStatus,
  updateSchemeFeatured,
} = require("../controllers/governmentSchemeController");

const {
  governmentSchemeValidation,
} = require("../validators/governmentSchemeValidator");

const validate = require("../middleware/validate");
const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

const router = express.Router();

// Public APIs
router.get("/", getSchemes);
router.get("/slug/:slug", getSchemeBySlug);
router.get("/:id", getSchemeById);

// Admin-only APIs
router.post(
  "/",
  protect,
  adminOnly,
  governmentSchemeValidation,
  validate,
  createScheme
);

router.patch(
  "/:id/status",
  protect,
  adminOnly,
  updateSchemeStatus
);

router.patch(
  "/:id/featured",
  protect,
  adminOnly,
  updateSchemeFeatured
);

router.patch(
  "/:id",
  protect,
  adminOnly,
  governmentSchemeValidation,
  validate,
  updateScheme
);

router.delete(
  "/:id",
  protect,
  adminOnly,
  deleteScheme
);

module.exports = router;
