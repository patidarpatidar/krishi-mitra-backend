
const mongoose = require("mongoose");

const isObject = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

const validateBlogPayload = (req, res, next) => {
  const body = req.body || {};
  const errors = [];
  const isCreate = req.method === "POST";

  const checkString = (value, field, maxLength, required = false) => {
    if (required && (typeof value !== "string" || !value.trim())) {
      errors.push(`${field} is required.`);
      return;
    }

    if (value !== undefined && typeof value !== "string") {
      errors.push(`${field} must be a string.`);
      return;
    }

    if (typeof value === "string" && maxLength && value.length > maxLength) {
      errors.push(`${field} must not exceed ${maxLength} characters.`);
    }
  };

  const checkBoolean = (value, field) => {
    if (value !== undefined && typeof value !== "boolean") {
      errors.push(`${field} must be a boolean.`);
    }
  };

  const checkNumber = (value, field, min = 0) => {
    if (
      value !== undefined &&
      (!Number.isFinite(Number(value)) || Number(value) < min)
    ) {
      errors.push(`${field} must be a number greater than or equal to ${min}.`);
    }
  };

  if (isCreate || body.title !== undefined) {
    checkString(body.title, "title", 250, true);
  }

  if (isCreate || body.slug !== undefined) {
    checkString(body.slug, "slug", 250, true);

    if (
      typeof body.slug === "string" &&
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(body.slug.trim())
    ) {
      errors.push("slug must contain lowercase letters, numbers, and hyphens.");
    }
  }

  if (isCreate) {
    if (!body.categoryId && !body.category) {
      errors.push("categoryId or category is required.");
    }
  }

  if (
    body.categoryId !== undefined &&
    body.categoryId !== null &&
    body.categoryId !== "" &&
    !mongoose.Types.ObjectId.isValid(body.categoryId)
  ) {
    errors.push("categoryId must be a valid MongoDB ObjectId.");
  }

  checkString(body.category, "category", 100);
  checkString(body.author, "author", 150);
  checkString(body.authorRole, "authorRole", 150);
  checkString(body.authorAvatar, "authorAvatar", 20);
  checkString(body.coverImage, "coverImage", 2000);
  checkString(body.excerpt, "excerpt", 2000);
  checkString(body.youtubeVideoId, "youtubeVideoId", 100);
  checkString(body.safetyNote, "safetyNote", 5000);

  if (body.date !== undefined && Number.isNaN(Date.parse(body.date))) {
    errors.push("date must be a valid date.");
  }

  ["readTime", "views", "likes", "comments"].forEach((field) => {
    checkNumber(body[field], field);
  });

  ["hasVideo", "hasGallery", "isFeatured"].forEach((field) => {
    checkBoolean(body[field], field);
  });

  if (
    body.status !== undefined &&
    !["draft", "published", "archived"].includes(body.status)
  ) {
    errors.push("status must be draft, published, or archived.");
  }

  if (body.tags !== undefined) {
    if (
      !Array.isArray(body.tags) ||
      body.tags.some((tag) => typeof tag !== "string")
    ) {
      errors.push("tags must be an array of strings.");
    }
  }

  if (body.content !== undefined) {
    if (!isObject(body.content)) {
      errors.push("content must be an object.");
    } else {
      checkString(body.content.introduction, "content.introduction", 10000);
      checkString(body.content.safetyNote, "content.safetyNote", 5000);

      if (body.content.sections !== undefined) {
        if (!Array.isArray(body.content.sections)) {
          errors.push("content.sections must be an array.");
        } else {
          body.content.sections.forEach((section, index) => {
            const prefix = `content.sections[${index}]`;

            if (!isObject(section)) {
              errors.push(`${prefix} must be an object.`);
              return;
            }

            checkString(section.id, `${prefix}.id`, 100, true);
            checkString(section.title, `${prefix}.title`, 250, true);

            if (
              section.paragraphs !== undefined &&
              (!Array.isArray(section.paragraphs) ||
                section.paragraphs.some((item) => typeof item !== "string"))
            ) {
              errors.push(`${prefix}.paragraphs must be an array of strings.`);
            }

            if (
              section.bullets !== undefined &&
              (!Array.isArray(section.bullets) ||
                section.bullets.some((item) => typeof item !== "string"))
            ) {
              errors.push(`${prefix}.bullets must be an array of strings.`);
            }
          });
        }
      }

      if (body.content.faqs !== undefined) {
        if (!Array.isArray(body.content.faqs)) {
          errors.push("content.faqs must be an array.");
        } else {
          body.content.faqs.forEach((faq, index) => {
            if (!isObject(faq)) {
              errors.push(`content.faqs[${index}] must be an object.`);
              return;
            }

            checkString(faq.question, `content.faqs[${index}].question`, 500, true);
            checkString(faq.answer, `content.faqs[${index}].answer`, 5000, true);
          });
        }
      }
    }
  }

  if (body.galleryImages !== undefined) {
    if (!Array.isArray(body.galleryImages)) {
      errors.push("galleryImages must be an array.");
    } else {
      body.galleryImages.forEach((item, index) => {
        if (!isObject(item)) {
          errors.push(`galleryImages[${index}] must be an object.`);
          return;
        }

        checkString(item.url, `galleryImages[${index}].url`, 2000, true);
        checkString(item.title, `galleryImages[${index}].title`, 250);
      });
    }
  }

  if (body.calculator !== undefined) {
    if (!isObject(body.calculator)) {
      errors.push("calculator must be an object.");
    } else {
      checkBoolean(body.calculator.enabled, "calculator.enabled");
      checkNumber(body.calculator.waterPerAcre, "calculator.waterPerAcre");

      if (body.calculator.recommendations !== undefined) {
        if (!Array.isArray(body.calculator.recommendations)) {
          errors.push("calculator.recommendations must be an array.");
        } else {
          body.calculator.recommendations.forEach((item, index) => {
            if (!isObject(item)) {
              errors.push(`calculator.recommendations[${index}] must be an object.`);
              return;
            }

            ["name", "type", "quantity", "unit", "note"].forEach((field) => {
              checkString(
                item[field],
                `calculator.recommendations[${index}].${field}`,
                1000
              );
            });
          });
        }
      }
    }
  }

  if (body.seo !== undefined) {
    if (!isObject(body.seo)) {
      errors.push("seo must be an object.");
    } else {
      checkString(body.seo.metaTitle, "seo.metaTitle", 60);
      checkString(body.seo.metaDescription, "seo.metaDescription", 160);
      checkString(body.seo.focusKeyword, "seo.focusKeyword", 150);
      checkString(body.seo.canonicalUrl, "seo.canonicalUrl", 2000);
      checkString(body.seo.ogTitle, "seo.ogTitle", 200);
      checkString(body.seo.ogDescription, "seo.ogDescription", 500);
      checkString(body.seo.ogImage, "seo.ogImage", 2000);
      checkString(body.seo.twitterTitle, "seo.twitterTitle", 200);
      checkString(body.seo.twitterDescription, "seo.twitterDescription", 500);
      checkString(body.seo.twitterImage, "seo.twitterImage", 2000);

      if (
        body.seo.keywords !== undefined &&
        (!Array.isArray(body.seo.keywords) ||
          body.seo.keywords.some((keyword) => typeof keyword !== "string"))
      ) {
        errors.push("seo.keywords must be an array of strings.");
      }

      if (
        body.seo.schemaType !== undefined &&
        !["Article", "BlogPosting", "NewsArticle"].includes(body.seo.schemaType)
      ) {
        errors.push("seo.schemaType must be Article, BlogPosting, or NewsArticle.");
      }

      ["allowIndex", "allowFollow"].forEach((field) => {
        checkBoolean(body.seo[field], `seo.${field}`);
      });
    }
  }

  if (errors.length) {
    return res.status(400).json({
      success: false,
      message: "Blog validation failed",
      errors,
    });
  }

  next();
};

module.exports = { validateBlogPayload };