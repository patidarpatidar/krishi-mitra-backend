
const validateBlogCategoryPayload = (req, res, next) => {
  const body = req.body || {};
  const errors = [];

  if (req.method === "POST" || body.label !== undefined) {
    if (
      typeof body.label !== "string" ||
      !body.label.trim() ||
      body.label.trim().length > 100
    ) {
      errors.push("label is required and must be at most 100 characters.");
    }
  }

  if (req.method === "POST" || body.slug !== undefined) {
    if (
      typeof body.slug !== "string" ||
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(body.slug.trim())
    ) {
      errors.push("slug must contain lowercase letters, numbers, and hyphens.");
    }
  }

  if (body.icon !== undefined && typeof body.icon !== "string") {
    errors.push("icon must be a string.");
  }

  if (
    body.description !== undefined &&
    typeof body.description !== "string"
  ) {
    errors.push("description must be a string.");
  }

  if (
    body.status !== undefined &&
    !["active", "inactive"].includes(body.status)
  ) {
    errors.push("status must be active or inactive.");
  }

  if (
    body.sortOrder !== undefined &&
    (!Number.isInteger(Number(body.sortOrder)) || Number(body.sortOrder) < 0)
  ) {
    errors.push("sortOrder must be a non-negative integer.");
  }

  if (errors.length) {
    return res.status(400).json({
      success: false,
      message: "Category validation failed",
      errors,
    });
  }

  next();
};

module.exports = { validateBlogCategoryPayload };