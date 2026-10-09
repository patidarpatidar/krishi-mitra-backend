const { body } = require("express-validator");

const schemeCategoryValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Category name is required")
    .isLength({ max: 100 })
    .withMessage(
      "Category name cannot exceed 100 characters"
    ),

  body("slug")
    .trim()
    .notEmpty()
    .withMessage("Category slug is required")
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .withMessage(
      "Slug must contain only lowercase letters, numbers and hyphens"
    ),

  body("description")
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 500 })
    .withMessage(
      "Description cannot exceed 500 characters"
    ),

  body("status")
    .optional()
    .isIn(["active", "inactive"])
    .withMessage(
      "Status must be active or inactive"
    ),
];

module.exports = {
  schemeCategoryValidation,
};