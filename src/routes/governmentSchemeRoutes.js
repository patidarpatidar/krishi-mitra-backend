
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
const GovernmentScheme = require("../models/GovernmentScheme");
const {
  createContentEngagementHandlers,
} = require("../controllers/contentEngagementController");
const schemeEngagement = createContentEngagementHandlers(
  GovernmentScheme,
  "scheme",
  { publicStatuses: ["active"] }
);

// Public APIs
router.get("/", getSchemes);
router.post("/:id/view", schemeEngagement.recordView);
router.put("/:id/like", schemeEngagement.setLike);
router.delete("/:id/like", schemeEngagement.setLike);
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
