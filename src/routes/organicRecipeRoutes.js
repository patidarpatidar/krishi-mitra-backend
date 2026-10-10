const express = require("express");

const router = express.Router();
const OrganicRecipe = require("../models/OrganicRecipe");
const {
  createContentEngagementHandlers,
} = require("../controllers/contentEngagementController");
const recipeEngagement = createContentEngagementHandlers(
  OrganicRecipe,
  "organic-recipe",
  { publicStatuses: ["active"] }
);

const {
  getRecipes,
  getRecipeById,
  getRecipeBySlug,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  updateRecipeStatus,
  updateRecipeFeatured,
} = require("../controllers/organicRecipeController");



const {
  organicRecipeValidation,
} = require("../validators/organicRecipeValidator");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const {
  validationResult,
} = require("express-validator");

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    });
  }

  next();
};

router.get("/", getRecipes);
router.post("/:id/view", recipeEngagement.recordView);
router.put("/:id/like", recipeEngagement.setLike);
router.delete("/:id/like", recipeEngagement.setLike);

router.get("/slug/:slug", getRecipeBySlug);

router.get("/admin/:id", protect, adminOnly, getRecipeById);
router.get("/admin", protect, adminOnly, getRecipes);

router.get("/:id", getRecipeById);

router.post(
  "/",
  protect,
  adminOnly,
  organicRecipeValidation,
  validateRequest,
  createRecipe
);

router.patch(
  "/:id",
  protect,
  adminOnly,
  organicRecipeValidation,
  validateRequest,
  updateRecipe
);

router.delete("/:id", protect, adminOnly, deleteRecipe);

router.patch(
  "/:id/status",
  protect,
  adminOnly,
  updateRecipeStatus
);

router.patch(
  "/:id/featured",
  protect,
  adminOnly,
  updateRecipeFeatured
);

module.exports = router;