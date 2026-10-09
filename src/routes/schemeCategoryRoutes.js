const express = require("express");

const {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/schemeCategoryController");

const {
  schemeCategoryValidation,
} = require("../validators/schemeCategoryValidator");

const validate = require("../middleware/validate");

const router = express.Router();

router.get("/", getCategories);

router.post(
  "/",
  schemeCategoryValidation,
  validate,
  createCategory
);

router.get("/:id", getCategoryById);

router.patch(
  "/:id",
  schemeCategoryValidation,
  validate,
  updateCategory
);

router.delete("/:id", deleteCategory);

module.exports = router;