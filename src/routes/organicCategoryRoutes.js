const express = require("express");

const router = express.Router();

const {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/organicCategoryController");

const {
  organicCategoryValidation,
} = require("../validators/organicCategoryValidator");

const { validationResult } = require("express-validator");

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

/* =========================
   GET ALL CATEGORIES
========================= */

router.get("/", getCategories);

/* =========================
   GET CATEGORY BY ID
========================= */

router.get("/:id", getCategoryById);

/* =========================
   CREATE CATEGORY
========================= */

router.post(
  "/",
  organicCategoryValidation,
  validateRequest,
  createCategory
);

/* =========================
   UPDATE CATEGORY
========================= */

router.patch(
  "/:id",
  organicCategoryValidation,
  validateRequest,
  updateCategory
);

/* =========================
   DELETE CATEGORY
========================= */

router.delete("/:id", deleteCategory);

/* =========================
   EXPORT ROUTER
========================= */

module.exports = router;