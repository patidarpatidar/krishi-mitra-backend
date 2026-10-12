const express = require("express");
const { body, param, validationResult } = require("express-validator");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const controller = require("../controllers/livestockCategoryController");

const router = express.Router();
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: "Invalid category data", errors: errors.array() });
  }
  return next();
};

router.get("/", controller.getCategories);
router.get("/:id", controller.getCategoryById);

router.post(
  "/",
  protect,
  adminOnly,
  body("name").isString().trim().notEmpty().isLength({ max: 100 }),
  body("slug").isString().trim().matches(slugPattern).isLength({ max: 100 }),
  body("icon").optional().isString().isLength({ max: 16 }),
  body("description").optional().isString().isLength({ max: 500 }),
  body("status").optional().isIn(["active", "inactive"]),
  body("sortOrder").optional().isInt({ min: 0 }),
  validate,
  controller.createCategory
);

router.patch(
  "/:id",
  protect,
  adminOnly,
  param("id").isMongoId(),
  body("name").optional().isString().trim().notEmpty().isLength({ max: 100 }),
  body("slug").optional().isString().trim().matches(slugPattern).isLength({ max: 100 }),
  body("icon").optional().isString().isLength({ max: 16 }),
  body("description").optional().isString().isLength({ max: 500 }),
  body("status").optional().isIn(["active", "inactive"]),
  body("sortOrder").optional().isInt({ min: 0 }),
  validate,
  controller.updateCategory
);

router.delete("/:id", protect, adminOnly, param("id").isMongoId(), validate, controller.deleteCategory);

module.exports = router;