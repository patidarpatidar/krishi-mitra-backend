
const mongoose = require("mongoose");
const LivestockArticle = require("../models/LivestockArticle");
const LivestockEngagement = require("../models/LivestockEngagement");

const editableFields = [
  "title",
  "slug",
  "subtitle",
  "category",
  "categoryLabel",
  "image",
  "intro",
  "facts",
  "sections",
  "faqs",
  "readTime",
  "updatedLabel",
  "metaTitle",
  "metaDescription",
  "keywords",
  "status",
  "featured",
  "sortOrder",
  "author",
];

const validCategorySlug = (value) =>
  typeof value === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);

const getVisitorId = (req) => {
  const value = req.body?.visitorId || req.headers["x-visitor-id"];

  if (
    typeof value !== "string" ||
    value.length < 8 ||
    value.length > 100
  ) {
    return null;
  }

  return value;
};

const getPagination = (req) => {
  const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
  const limit = Math.min(
    50,
    Math.max(1, Number.parseInt(req.query.limit, 10) || 10)
  );

  return { page, limit, skip: (page - 1) * limit };
};

// PUBLIC: GET /api/livestock
exports.getPublicArticles = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req);
    const { category, search, featured } = req.query;

    const filter = { status: "published" };

    if (category && category !== "all") {
      if (!validCategorySlug(category)) {
        return res.status(400).json({
          success: false,
          message: "Invalid category",
        });
      }
      filter.category = category;
    }

    if (featured === "true") filter.featured = true;

    if (typeof search === "string" && search.trim()) {
      const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { title: { $regex: escaped, $options: "i" } },
        { subtitle: { $regex: escaped, $options: "i" } },
        { intro: { $regex: escaped, $options: "i" } },
        { keywords: { $regex: escaped, $options: "i" } },
      ];
    }

    const [articles, total] = await Promise.all([
      LivestockArticle.find(filter)
        .select(
          "title slug subtitle category categoryLabel image intro readTime updatedLabel featured viewsCount likesCount publishedAt createdAt"
        )
        .sort({ featured: -1, sortOrder: 1, publishedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      LivestockArticle.countDocuments(filter),
    ]);

    return res.json({
      success: true,
      data: articles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("getPublicArticles:", error);
    return res.status(500).json({
      success: false,
      message: "Articles fetch नहीं हो पाए",
    });
  }
};

// PUBLIC: GET /api/livestock/slug/:slug
exports.getPublicArticleBySlug = async (req, res) => {
  try {
    const article = await LivestockArticle.findOne({
      slug: req.params.slug,
      status: "published",
    }).lean();

    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article नहीं मिला",
      });
    }

    return res.json({ success: true, data: article });
  } catch (error) {
    console.error("getPublicArticleBySlug:", error);
    return res.status(500).json({
      success: false,
      message: "Article fetch नहीं हो पाया",
    });
  }
};

// ADMIN: GET /api/livestock/admin
exports.getAdminArticles = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req);
    const { category, status, search } = req.query;
    const filter = {};

    if (category && category !== "all") {
      if (!validCategorySlug(category)) {
        return res.status(400).json({
          success: false,
          message: "Invalid category",
        });
      }
      filter.category = category;
    }

    if (["draft", "published", "archived"].includes(status)) {
      filter.status = status;
    }

    if (typeof search === "string" && search.trim()) {
      const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { title: { $regex: escaped, $options: "i" } },
        { slug: { $regex: escaped, $options: "i" } },
      ];
    }

    const [articles, total, counts] = await Promise.all([
      LivestockArticle.find(filter)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      LivestockArticle.countDocuments(filter),
      LivestockArticle.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
            views: { $sum: "$viewsCount" },
            likes: { $sum: "$likesCount" },
          },
        },
      ]),
    ]);

    return res.json({
      success: true,
      data: articles,
      stats: counts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("getAdminArticles:", error);
    return res.status(500).json({
      success: false,
      message: "Admin articles fetch नहीं हो पाए",
    });
  }
};

// ADMIN: GET /api/livestock/admin/:id
exports.getAdminArticleById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid article ID",
      });
    }

    const article = await LivestockArticle.findById(req.params.id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article नहीं मिला",
      });
    }

    return res.json({ success: true, data: article });
  } catch (error) {
    console.error("getAdminArticleById:", error);
    return res.status(500).json({
      success: false,
      message: "Article fetch नहीं हो पाया",
    });
  }
};

// ADMIN: POST /api/livestock/admin
exports.createArticle = async (req, res) => {
  try {
    const { title, slug, category } = req.body;

    if (
      !title?.trim() ||
      !slug?.trim() ||
      !validCategorySlug(category)
    ) {
      return res.status(400).json({
        success: false,
        message: "Title, slug और valid category जरूरी हैं",
      });
    }

    const payload = {};
    for (const field of editableFields) {
      if (req.body[field] !== undefined) {
        payload[field] = req.body[field];
      }
    }

    payload.slug = payload.slug.trim().toLowerCase();
    payload.title = payload.title.trim();

    if (payload.status === "published") {
      payload.publishedAt = new Date();
    }

    const article = await LivestockArticle.create(payload);

    return res.status(201).json({
      success: true,
      message: "Article create हो गया",
      data: article,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "यह slug पहले से मौजूद है",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    console.error("createArticle:", error);
    return res.status(500).json({
      success: false,
      message: "Article create नहीं हो पाया",
    });
  }
};

// ADMIN: PATCH /api/livestock/admin/:id
exports.updateArticle = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid article ID",
      });
    }

    const payload = {};
    for (const field of editableFields) {
      if (req.body[field] !== undefined) {
        payload[field] = req.body[field];
      }
    }

    if (payload.slug !== undefined) {
      payload.slug = payload.slug.trim().toLowerCase();
    }

    if (payload.title !== undefined) {
      payload.title = payload.title.trim();
    }

    if (payload.category && !validCategorySlug(payload.category)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category",
      });
    }

    const current = await LivestockArticle.findById(req.params.id);

    if (!current) {
      return res.status(404).json({
        success: false,
        message: "Article नहीं मिला",
      });
    }

    if (payload.status === "published" && !current.publishedAt) {
      payload.publishedAt = new Date();
    }

    const article = await LivestockArticle.findByIdAndUpdate(
      req.params.id,
      { $set: payload },
      { new: true, runValidators: true }
    );

    return res.json({
      success: true,
      message: "Article update हो गया",
      data: article,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "यह slug पहले से मौजूद है",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    console.error("updateArticle:", error);
    return res.status(500).json({
      success: false,
      message: "Article update नहीं हो पाया",
    });
  }
};

// ADMIN: DELETE /api/livestock/admin/:id
exports.deleteArticle = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid article ID",
      });
    }

    const article = await LivestockArticle.findByIdAndDelete(req.params.id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article नहीं मिला",
      });
    }

    await LivestockEngagement.deleteMany({ articleId: article._id });

    return res.json({
      success: true,
      message: "Article delete हो गया",
    });
  } catch (error) {
    console.error("deleteArticle:", error);
    return res.status(500).json({
      success: false,
      message: "Article delete नहीं हो पाया",
    });
  }
};

// PUBLIC: POST /api/livestock/:id/view
exports.recordView = async (req, res) => {
  try {
    const visitorId = getVisitorId(req);

    if (!visitorId) {
      return res.status(400).json({
        success: false,
        message: "Valid visitorId जरूरी है",
      });
    }

    const article = await LivestockArticle.findOne({
      _id: req.params.id,
      status: "published",
    }).select("_id");
    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article नहीं मिला",
      });
    }

    try {
      await LivestockEngagement.create({
        articleId: article._id,
        visitorId,
        action: "view",
      });
      await LivestockArticle.updateOne(
        { _id: article._id, status: "published" },
        { $inc: { viewsCount: 1 } }
      );
    } catch (error) {
      if (error.code !== 11000) throw error;
    }

    const latest = await LivestockArticle.findOne({
      _id: req.params.id,
      status: "published",
    })
      .select("viewsCount likesCount")
      .lean();

    if (!latest) {
      return res.status(404).json({
        success: false,
        message: "Article नहीं मिला",
      });
    }

    const liked = await LivestockEngagement.exists({
      articleId: latest._id,
      visitorId,
      action: "like",
    });

    return res.json({
      success: true,
      data: {
        ...latest,
        views: latest.viewsCount,
        likes: latest.likesCount,
        liked: Boolean(liked),
      },
    });
  } catch (error) {
    console.error("recordView:", error);
    return res.status(500).json({
      success: false,
      message: "View record नहीं हो पाया",
    });
  }
};

// PUBLIC: PUT|DELETE /api/livestock/:id/like
exports.likeArticle = async (req, res) => {
  try {
    const visitorId = getVisitorId(req);

    if (!visitorId) {
      return res.status(400).json({
        success: false,
        message: "Valid visitorId जरूरी है",
      });
    }

    const article = await LivestockArticle.findOne({
      _id: req.params.id,
      status: "published",
    }).select("_id");

    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article नहीं मिला",
      });
    }

    const filter = { articleId: article._id, visitorId, action: "like" };
    const shouldLike = req.method !== "DELETE";
    let alreadyLiked = false;

    if (shouldLike) {
      try {
        await LivestockEngagement.create(filter);
        await LivestockArticle.updateOne(
          { _id: article._id, status: "published" },
          { $inc: { likesCount: 1 } }
        );
      } catch (error) {
        if (error.code !== 11000) throw error;
        alreadyLiked = true;
      }
    } else {
      const result = await LivestockEngagement.deleteOne(filter);
      if (result.deletedCount > 0) {
        await LivestockArticle.updateOne(
          { _id: article._id, status: "published" },
          { $inc: { likesCount: -1 } }
        );
      }
    }

    const latest = await LivestockArticle.findOne({
      _id: article._id,
      status: "published",
    })
      .select("viewsCount likesCount")
      .lean();
    if (!latest) {
      return res.status(404).json({
        success: false,
        message: "Article नहीं मिला",
      });
    }

    return res.json({
      success: true,
      alreadyLiked: shouldLike && alreadyLiked,
      data: {
        ...(latest || {}),
        views: latest.viewsCount || 0,
        likes: latest.likesCount || 0,
        liked: shouldLike,
      },
    });
  } catch (error) {
    console.error("likeArticle:", error);
    return res.status(500).json({
      success: false,
      message: "Like save नहीं हो पाया",
    });
  }
};