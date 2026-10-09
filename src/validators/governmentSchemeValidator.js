const { body } = require("express-validator");

const governmentSchemeValidation = [
  // =====================================================
  // BASIC INFORMATION
  // =====================================================

  body("id")
    .trim()
    .notEmpty()
    .withMessage("Scheme ID is required")
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .withMessage(
      "Scheme ID must contain lowercase letters, numbers and hyphens"
    ),

  body("slug")
    .trim()
    .notEmpty()
    .withMessage("Scheme slug is required")
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .withMessage(
      "Scheme slug must contain lowercase letters, numbers and hyphens"
    ),

  body("name")
    .trim()
    .notEmpty()
    .withMessage("Scheme name is required")
    .isLength({ max: 250 })
    .withMessage("Scheme name cannot exceed 250 characters"),

  body("shortName")
    .trim()
    .notEmpty()
    .withMessage("Short name is required")
    .isLength({ max: 100 })
    .withMessage("Short name cannot exceed 100 characters"),

  body("level")
    .trim()
    .notEmpty()
    .withMessage("Government level is required")
    .isLength({ max: 150 })
    .withMessage("Government level cannot exceed 150 characters"),

  body("government")
    .trim()
    .notEmpty()
    .withMessage("Government name is required")
    .isLength({ max: 200 })
    .withMessage("Government name cannot exceed 200 characters"),

  body("department")
    .trim()
    .notEmpty()
    .withMessage("Department is required")
    .isLength({ max: 250 })
    .withMessage("Department cannot exceed 250 characters"),

  // =====================================================
  // CATEGORY
  // =====================================================

  body("category")
    .trim()
    .notEmpty()
    .withMessage("Category is required")
    .isLength({ max: 150 })
    .withMessage("Category cannot exceed 150 characters"),

  body("categoryId")
    .optional({ nullable: true, checkFalsy: true })
    .isMongoId()
    .withMessage("Invalid category ID"),

  body("categorySlug")
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .withMessage(
      "Category slug must contain lowercase letters, numbers and hyphens"
    ),

  // =====================================================
  // ICON
  // =====================================================

  body("icon")
    .trim()
    .notEmpty()
    .withMessage("Icon is required")
    .isLength({ max: 100 })
    .withMessage("Icon cannot exceed 100 characters"),

  // =====================================================
  // DESCRIPTION
  // =====================================================

  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ max: 5000 })
    .withMessage("Description cannot exceed 5000 characters"),

  // =====================================================
  // BENEFITS
  // =====================================================

  body("benefits")
    .isArray()
    .withMessage("Benefits must be an array"),

  body("benefits.*")
    .trim()
    .notEmpty()
    .withMessage("Benefit cannot be empty")
    .isLength({ max: 1000 })
    .withMessage("Benefit cannot exceed 1000 characters"),

  // =====================================================
  // ELIGIBILITY
  // =====================================================

  body("eligibility")
    .isArray()
    .withMessage("Eligibility must be an array"),

  body("eligibility.*")
    .trim()
    .notEmpty()
    .withMessage("Eligibility item cannot be empty")
    .isLength({ max: 1000 })
    .withMessage(
      "Eligibility item cannot exceed 1000 characters"
    ),

  // =====================================================
  // DOCUMENTS
  // =====================================================

  body("documents")
    .isArray()
    .withMessage("Documents must be an array"),

  body("documents.*")
    .trim()
    .notEmpty()
    .withMessage("Document cannot be empty")
    .isLength({ max: 500 })
    .withMessage("Document cannot exceed 500 characters"),

  // =====================================================
  // HOW TO APPLY
  // =====================================================

  body("howToApply")
    .isArray()
    .withMessage("How to apply must be an array"),

  body("howToApply.*")
    .trim()
    .notEmpty()
    .withMessage("How to apply step cannot be empty")
    .isLength({ max: 1500 })
    .withMessage(
      "How to apply step cannot exceed 1500 characters"
    ),

  // =====================================================
  // IMPORTANT LINKS
  // =====================================================

  body("importantLinks")
    .isArray()
    .withMessage("Important links must be an array"),

  body("importantLinks.*.title")
    .trim()
    .notEmpty()
    .withMessage("Important link title is required")
    .isLength({ max: 200 })
    .withMessage(
      "Important link title cannot exceed 200 characters"
    ),

  body("importantLinks.*.url")
    .trim()
    .notEmpty()
    .withMessage("Important link URL is required")
    .isURL({
      protocols: ["http", "https"],
      require_protocol: true,
    })
    .withMessage("Important link URL must be a valid HTTP/HTTPS URL"),

  body("importantLinks.*.type")
    .trim()
    .notEmpty()
    .withMessage("Important link type is required")
    .isLength({ max: 50 })
    .withMessage(
      "Important link type cannot exceed 50 characters"
    ),

  // =====================================================
  // SOURCE
  // =====================================================

  body("sourceName")
    .trim()
    .notEmpty()
    .withMessage("Source name is required")
    .isLength({ max: 250 })
    .withMessage(
      "Source name cannot exceed 250 characters"
    ),

  body("sourceUrl")
    .trim()
    .notEmpty()
    .withMessage("Source URL is required")
    .isURL({
      protocols: ["http", "https"],
      require_protocol: true,
    })
    .withMessage(
      "Source URL must be a valid HTTP/HTTPS URL"
    ),

  // =====================================================
  // HELPLINE
  // =====================================================

  body("helpline")
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage(
      "Helpline cannot exceed 100 characters"
    ),

  // =====================================================
  // LAST VERIFIED
  // =====================================================

  body("lastVerifiedAt")
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage(
      "Last verified date cannot exceed 100 characters"
    ),

  // =====================================================
  // TAGS
  // =====================================================

  body("tags")
    .isArray()
    .withMessage("Tags must be an array"),

  body("tags.*")
    .trim()
    .notEmpty()
    .withMessage("Tag cannot be empty")
    .isLength({ max: 100 })
    .withMessage("Tag cannot exceed 100 characters"),

  // =====================================================
  // SEO
  // =====================================================

  body("seo")
    .optional()
    .isObject()
    .withMessage("SEO must be an object"),

  body("seo.metaTitle")
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 70 })
    .withMessage(
      "SEO meta title cannot exceed 70 characters"
    ),

  body("seo.metaDescription")
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 170 })
    .withMessage(
      "SEO meta description cannot exceed 170 characters"
    ),

  body("seo.keywords")
    .optional()
    .isArray()
    .withMessage("SEO keywords must be an array"),

  body("seo.keywords.*")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage(
      "SEO keyword cannot exceed 100 characters"
    ),

  body("seo.focusKeyword")
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 150 })
    .withMessage(
      "SEO focus keyword cannot exceed 150 characters"
    ),

  body("seo.canonicalUrl")
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isURL({
      protocols: ["http", "https"],
      require_protocol: true,
    })
    .withMessage(
      "Canonical URL must be a valid HTTP/HTTPS URL"
    ),

  body("seo.ogTitle")
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage(
      "OG title cannot exceed 100 characters"
    ),

  body("seo.ogDescription")
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 300 })
    .withMessage(
      "OG description cannot exceed 300 characters"
    ),

  body("seo.ogImage")
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isURL({
      protocols: ["http", "https"],
      require_protocol: true,
    })
    .withMessage(
      "OG image must be a valid HTTP/HTTPS URL"
    ),

  body("seo.twitterTitle")
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage(
      "Twitter title cannot exceed 100 characters"
    ),

  body("seo.twitterDescription")
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 300 })
    .withMessage(
      "Twitter description cannot exceed 300 characters"
    ),

  body("seo.twitterImage")
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isURL({
      protocols: ["http", "https"],
      require_protocol: true,
    })
    .withMessage(
      "Twitter image must be a valid HTTP/HTTPS URL"
    ),

  body("seo.schemaType")
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage(
      "Schema type cannot exceed 100 characters"
    ),

  body("seo.allowIndex")
    .optional()
    .isBoolean()
    .withMessage("SEO allowIndex must be boolean"),

  body("seo.allowFollow")
    .optional()
    .isBoolean()
    .withMessage("SEO allowFollow must be boolean"),

  // =====================================================
  // PUBLISHING
  // =====================================================

  body("featured")
    .optional()
    .isBoolean()
    .withMessage("Featured must be boolean"),

  body("status")
    .optional()
    .isIn([
      "active",
      "inactive",
      "draft",
      "archived",
    ])
    .withMessage(
      "Status must be active, inactive, draft or archived"
    ),

  // =====================================================
  // ANALYTICS
  // =====================================================

  body("views")
    .optional()
    .isInt({ min: 0 })
    .withMessage(
      "Views must be a non-negative integer"
    ),

  body("likes")
    .optional()
    .isInt({ min: 0 })
    .withMessage(
      "Likes must be a non-negative integer"
    ),

  // =====================================================
  // DATES
  // =====================================================

  body("publishedAt")
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601()
    .withMessage(
      "publishedAt must be a valid ISO date"
    ),

  body("updatedAtContent")
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601()
    .withMessage(
      "updatedAtContent must be a valid ISO date"
    ),
];

module.exports = {
  governmentSchemeValidation,
};