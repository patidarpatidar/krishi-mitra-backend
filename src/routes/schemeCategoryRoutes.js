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
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", getCategories);

router.post(
  "/",
  protect,
  adminOnly,
  schemeCategoryValidation,
  validate,
  createCategory
);

router.get("/:id", getCategoryById);

router.patch(
  "/:id",
  protect,
  adminOnly,
  schemeCategoryValidation,
  validate,
  updateCategory
);

router.delete("/:id", protect, adminOnly, deleteCategory);

module.exports = router;