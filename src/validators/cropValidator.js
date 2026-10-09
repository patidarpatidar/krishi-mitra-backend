const { body } = require("express-validator");

const cropValidation = [
  body("slug")
    .trim()
    .notEmpty()
    .withMessage("Slug is required")
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .withMessage(
      "Slug must contain only lowercase letters, numbers and hyphens"
    ),

  body("name")
    .trim()
    .notEmpty()
    .withMessage("Crop name is required"),

  body("englishName")
    .trim()
    .notEmpty()
    .withMessage("English name is required"),

  body("category.key")
    .trim()
    .notEmpty()
    .withMessage("Category key is required"),

  body("category.label")
    .trim()
    .notEmpty()
    .withMessage("Category label is required"),

  body("season.key")
    .trim()
    .notEmpty()
    .withMessage("Season key is required"),

  body("season.label")
    .trim()
    .notEmpty()
    .withMessage("Season label is required"),

  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required"),

  body("durationDays")
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage("Duration days must be a positive number"),

  body("regions")
    .optional()
    .isArray()
    .withMessage("Regions must be an array"),

  body("tags")
    .optional()
    .isArray()
    .withMessage("Tags must be an array"),

  body("varieties")
    .optional()
    .isArray()
    .withMessage("Varieties must be an array"),

  body("diseases")
    .optional()
    .isArray()
    .withMessage("Diseases must be an array"),

  body("featured")
    .optional()
    .isBoolean()
    .withMessage("Featured must be true or false"),

  body("status")
    .optional()
    .isIn(["draft", "published", "archived"])
    .withMessage(
      "Status must be draft, published or archived"
    ),

  body("seo.metaTitle")
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 70 })
    .withMessage("SEO meta title cannot exceed 70 characters"),

  body("seo.metaDescription")
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 160 })
    .withMessage(
      "SEO meta description cannot exceed 160 characters"
    ),

  body("seo.keywords")
    .optional()
    .isArray()
    .withMessage("SEO keywords must be an array"),

  body("seo.allowIndex")
    .optional()
    .isBoolean()
    .withMessage("SEO allowIndex must be true or false"),

  body("seo.allowFollow")
    .optional()
    .isBoolean()
    .withMessage("SEO allowFollow must be true or false"),
];

module.exports = {
  cropValidation,
};