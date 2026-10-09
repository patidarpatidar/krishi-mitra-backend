const { body } = require("express-validator");

const organicCategoryValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Category name is required"),

  body("slug")
    .trim()
    .notEmpty()
    .withMessage("Category slug is required")
    .matches(/^[a-z0-9-]+$/)
    .withMessage(
      "Slug can contain only lowercase letters, numbers and hyphens"
    ),

  body("description")
    .optional()
    .trim(),

  body("status")
    .optional()
    .isIn(["active", "inactive"])
    .withMessage("Invalid category status"),
];

module.exports = {
  organicCategoryValidation,
};