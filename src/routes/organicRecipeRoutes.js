const express = require("express");

const router = express.Router();

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

router.get("/slug/:slug", getRecipeBySlug);

router.get("/:id", getRecipeById);

router.post(
  "/",
  organicRecipeValidation,
  validateRequest,
  createRecipe
);

router.patch(
  "/:id",
  organicRecipeValidation,
  validateRequest,
  updateRecipe
);

router.delete("/:id", deleteRecipe);

router.patch(
  "/:id/status",
  updateRecipeStatus
);

router.patch(
  "/:id/featured",
  updateRecipeFeatured
);

module.exports = router;