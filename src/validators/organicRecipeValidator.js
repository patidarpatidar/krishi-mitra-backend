const { body } = require("express-validator");

const organicRecipeValidation = [
  body("id")
    .trim()
    .notEmpty()
    .withMessage("Recipe id is required"),

  body("slug")
    .trim()
    .notEmpty()
    .withMessage("Recipe slug is required")
    .matches(/^[a-z0-9-]+$/)
    .withMessage(
      "Slug can contain only lowercase letters, numbers and hyphens"
    ),

  body("title")
    .trim()
    .notEmpty()
    .withMessage("Recipe title is required"),

  body("type")
    .trim()
    .notEmpty()
    .withMessage("Recipe type is required"),

  body("category")
    .isString()
    .trim()
    .notEmpty()
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .withMessage("Invalid organic recipe category"),

  body("target")
    .trim()
    .notEmpty()
    .withMessage("Target is required"),

  body("costMin")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("costMin must be a positive number"),

  body("costMax")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("costMax must be a positive number"),

  body("baseArea")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("baseArea must be a positive number"),

  body("baseWater")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("baseWater must be a positive number"),

  body("baseIngredients")
    .optional()
    .isArray()
    .withMessage("baseIngredients must be an array"),

  body("baseIngredients.*.name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Ingredient name is required"),

  body("baseIngredients.*.amount")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Ingredient amount must be a positive number"),

  body("baseIngredients.*.unit")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Ingredient unit is required"),

  body("processSteps")
    .optional()
    .isArray()
    .withMessage("processSteps must be an array"),

  body("status")
    .optional()
    .isIn(["active", "inactive", "draft", "archived"])
    .withMessage("Invalid recipe status"),

  body("featured")
    .optional()
    .isBoolean()
    .withMessage("featured must be boolean"),

  body("seo.allowIndex")
    .optional()
    .isBoolean(),

  body("seo.allowFollow")
    .optional()
    .isBoolean(),
];

module.exports = {
  organicRecipeValidation,
};