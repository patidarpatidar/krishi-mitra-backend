const { body, param, query, validationResult } = require("express-validator");
const mongoose = require("mongoose");

const allowedCategories = [
"dairy",
"goat",
"poultry",
"fodder",
"health",
"schemes",
];

const allowedStatuses = ["draft", "published", "archived"];

const validateRequest = (req, res, next) => {
const errors = validationResult(req);

if (!errors.isEmpty()) {
return res.status(422).json({
success: false,
message: "Validation failed",
errors: errors.array().map((error) => ({
field: error.path,
message: error.msg,
})),
});
}

next();
};

const articleFields = [
body("title")
.optional()
.isString()
.withMessage("Title must be a string")
.trim()
.notEmpty()
.withMessage("Title is required")
.isLength({ max: 200 })
.withMessage("Title cannot exceed 200 characters"),

body("slug")
.optional()
.isString()
.withMessage("Slug must be a string")
.trim()
.matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
.withMessage("Slug must contain lowercase letters, numbers and hyphens only")
.isLength({ max: 200 })
.withMessage("Slug cannot exceed 200 characters"),

body("subtitle")
.optional()
.isString()
.withMessage("Subtitle must be a string")
.isLength({ max: 300 }),

body("category")
.optional()
.isIn(allowedCategories)
.withMessage("Invalid category"),

body("categoryLabel")
.optional()
.isString()
.isLength({ max: 100 }),

body("image")
.optional()
.isString()
.isLength({ max: 2000 })
.withMessage("Image URL is too long"),

body("intro")
.optional()
.isString()
.isLength({ max: 10000 })
.withMessage("Intro cannot exceed 10000 characters"),

body("facts")
.optional()
.isArray({ max: 30 })
.withMessage("Facts must be an array with at most 30 items"),

body("facts.*")
.optional()
.isArray({ min: 2, max: 2 })
.withMessage("Each fact must contain exactly two values"),

body("facts.*.*")
.optional()
.isString()
.withMessage("Fact values must be strings")
.isLength({ max: 1000 }),

body("sections")
.optional()
.isArray({ max: 50 })
.withMessage("Sections must be an array with at most 50 items"),

body("sections.*.id")
.optional()
.isString()
.trim()
.notEmpty()
.withMessage("Section ID is required")
.isLength({ max: 100 }),

body("sections.*.title")
.optional()
.isString()
.trim()
.notEmpty()
.withMessage("Section title is required")
.isLength({ max: 200 }),

body("sections.*.content")
.optional()
.isString()
.notEmpty()
.withMessage("Section content is required")
.isLength({ max: 20000 }),

body("sections.*.points")
.optional()
.isArray({ max: 50 })
.withMessage("Section points must be an array"),

body("sections.*.points.*")
.optional()
.isString()
.isLength({ max: 2000 }),

body("faqs")
.optional()
.isArray({ max: 50 })
.withMessage("FAQs must be an array with at most 50 items"),

body("faqs.*.q")
.optional()
.isString()
.trim()
.notEmpty()
.withMessage("FAQ question is required")
.isLength({ max: 1000 }),

body("faqs.*.a")
.optional()
.isString()
.trim()
.notEmpty()
.withMessage("FAQ answer is required")
.isLength({ max: 5000 }),

body("readTime")
.optional()
.isString()
.isLength({ max: 50 }),

body("updatedLabel")
.optional()
.isString()
.isLength({ max: 100 }),

body("metaTitle")
.optional()
.isString()
.isLength({ max: 200 }),

body("metaDescription")
.optional()
.isString()
.isLength({ max: 500 }),

body("keywords")
.optional()
.isArray({ max: 50 })
.withMessage("Keywords must be an array"),

body("keywords.*")
.optional()
.isString()
.trim()
.isLength({ max: 100 }),

body("status")
.optional()
.isIn(allowedStatuses)
.withMessage("Invalid article status"),

body("featured")
.optional()
.isBoolean()
.withMessage("Featured must be true or false"),

body("sortOrder")
.optional()
.isInt({ min: 0, max: 100000 })
.withMessage("Sort order must be a non-negative integer"),

body("author")
.optional()
.isString()
.trim()
.isLength({ max: 100 }),
];

const createLivestockArticleValidator = [
body("title")
.isString()
.trim()
.notEmpty()
.withMessage("Title is required")
.isLength({ max: 200 }),

body("slug")
.isString()
.trim()
.matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
.withMessage("A valid lowercase slug is required")
.isLength({ max: 200 }),

body("category")
.isIn(allowedCategories)
.withMessage("A valid category is required"),

...articleFields,
validateRequest,
];

const updateLivestockArticleValidator = [
param("id")
.custom((value) => mongoose.isValidObjectId(value))
.withMessage("Invalid article ID"),

...articleFields,
validateRequest,
];

const articleIdValidator = [
param("id")
.custom((value) => mongoose.isValidObjectId(value))
.withMessage("Invalid article ID"),
validateRequest,
];

const slugValidator = [
param("slug")
.matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
.withMessage("Invalid article slug"),
validateRequest,
];

const listLivestockValidator = [
query("category")
.optional()
.isIn(allowedCategories)
.withMessage("Invalid category"),

query("status")
.optional()
.isIn(allowedStatuses)
.withMessage("Invalid status"),

query("page")
.optional()
.isInt({ min: 1 })
.withMessage("Page must be at least 1"),

query("limit")
.optional()
.isInt({ min: 1, max: 50 })
.withMessage("Limit must be between 1 and 50"),

query("featured")
.optional()
.isBoolean()
.withMessage("Featured must be true or false"),

validateRequest,
];

const engagementValidator = [
param("id")
.custom((value) => mongoose.isValidObjectId(value))
.withMessage("Invalid article ID"),

body("visitorId")
.optional()
.isString()
.withMessage("Visitor ID must be a string")
.isLength({ min: 8, max: 100 })
.withMessage("Visitor ID must contain 8–100 characters"),

validateRequest,
];

module.exports = {
validateRequest,
createLivestockArticleValidator,
updateLivestockArticleValidator,
articleIdValidator,
slugValidator,
listLivestockValidator,
engagementValidator,
};
