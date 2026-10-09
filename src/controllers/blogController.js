
const mongoose = require("mongoose");
const Blog = require("../models/Blog");
const BlogCategory = require("../models/BlogCategory");

// GET /api/blogs
// Public: published blogs only
// Admin: all statuses when called through a protected admin route
exports.getBlogs = async (req, res) => {
  try {
    const {
      search,
      category,
      status,
      featured,
      sort = "latest",
      page = 1,
      limit = 10,
    } = req.query;

    const filter = {};

    if (req.user?.role === "admin") {
      if (status) filter.status = status;
    } else {
      filter.status = "published";
    }

    if (category) {
      if (mongoose.Types.ObjectId.isValid(category)) {
        filter.categoryId = category;
      } else {
        const categoryDoc = await BlogCategory.findOne({
          $or: [
            { slug: category },
            { label: { $regex: `^${escapeRegex(category)}$`, $options: "i" } },
          ],
        }).lean();

        if (categoryDoc) {
          filter.categoryId = categoryDoc._id;
        } else {
          filter.category = {
            $regex: `^${escapeRegex(category)}$`,
            $options: "i",
          };
        }
      }
    }

    if (featured !== undefined) {
      filter.isFeatured = featured === "true";
    }

    if (search?.trim()) {
      const searchRegex = new RegExp(escapeRegex(search.trim()), "i");
      filter.$or = [
        { title: searchRegex },
        { excerpt: searchRegex },
        { tags: searchRegex },
      ];
    }

    const sortOptions = {
      latest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      popular: { views: -1 },
      mostLiked: { likes: -1 },
      mostViewed: { views: -1 },
    };

    const sortBy = sortOptions[sort] || sortOptions.latest;
    const pageNumber = Math.max(1, Number.parseInt(page, 10) || 1);
    const limitNumber = Math.min(
      100,
      Math.max(1, Number.parseInt(limit, 10) || 10)
    );

    const [blogs, total] = await Promise.all([
      Blog.find(filter)
        .sort(sortBy)
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber)
        .lean(),
      Blog.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: blogs,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber),
      },
    });
  } catch (error) {
    console.error("getBlogs error:", error);
    return res.status(500).json({
      success: false,
      message: "Blogs fetch करने में समस्या हुई।",
    });
  }
};

// GET /api/blogs/admin/:id
// Protect this route with protect + adminOnly
exports.getBlogById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid blog ID.",
      });
    }

    const blog = await Blog.findById(id).lean();

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog नहीं मिला।",
      });
    }

    return res.status(200).json({
      success: true,
      data: blog,
    });
  } catch (error) {
    console.error("getBlogById error:", error);
    return res.status(500).json({
      success: false,
      message: "Blog fetch करने में समस्या हुई।",
    });
  }
};

// GET /api/blogs/slug/:slug
// Public: published blogs only
exports.getBlogBySlug = async (req, res) => {
  try {
    const slug = req.params.slug?.trim();

    const blog = await Blog.findOne({
      slug,
      status: "published",
    }).lean();

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Published blog नहीं मिला।",
      });
    }

    return res.status(200).json({
      success: true,
      data: blog,
    });
  } catch (error) {
    console.error("getBlogBySlug error:", error);
    return res.status(500).json({
      success: false,
      message: "Blog fetch करने में समस्या हुई।",
    });
  }
};

// POST /api/blogs/admin
exports.createBlog = async (req, res) => {
  try {
    const {
      title,
      slug,
      categoryId,
      category,
      status,
      publishedAt,
      ...rest
    } = req.body;

    if (!title?.trim() || !slug?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Title और slug जरूरी हैं।",
      });
    }

    const normalizedSlug = slugify(slug);

    const existingBlog = await Blog.findOne({
      slug: normalizedSlug,
    }).lean();

    if (existingBlog) {
      return res.status(409).json({
        success: false,
        message: "यह slug पहले से मौजूद है।",
      });
    }

    let resolvedCategoryId = categoryId || undefined;
    let resolvedCategory = category || "";

    if (categoryId) {
      if (!mongoose.Types.ObjectId.isValid(categoryId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid category ID.",
        });
      }

      const categoryDoc = await BlogCategory.findById(categoryId);

      if (!categoryDoc) {
        return res.status(400).json({
          success: false,
          message: "Blog category नहीं मिली।",
        });
      }

      resolvedCategoryId = categoryDoc._id;
      resolvedCategory = categoryDoc.label;
    } else if (category?.trim()) {
      const categoryDoc = await BlogCategory.findOne({
        $or: [
          { slug: category.trim() },
          {
            label: {
              $regex: `^${escapeRegex(category.trim())}$`,
              $options: "i",
            },
          },
        ],
      });

      if (categoryDoc) {
        resolvedCategoryId = categoryDoc._id;
        resolvedCategory = categoryDoc.label;
      }
    }

    const allowedFields = pickAllowedFields(rest);

    const blogStatus = status || "draft";

    if (!["draft", "published", "archived"].includes(blogStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid blog status.",
      });
    }

    const blog = await Blog.create({
      ...allowedFields,
      title: title.trim(),
      slug: normalizedSlug,
      categoryId: resolvedCategoryId,
      category: resolvedCategory,
      status: blogStatus,
      publishedAt:
        blogStatus === "published"
          ? publishedAt || new Date()
          : undefined,
    });

    return res.status(201).json({
      success: true,
      message: "Blog सफलतापूर्वक create हुआ।",
      data: blog,
    });
  } catch (error) {
    console.error("createBlog error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "यह slug पहले से मौजूद है।",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Blog create करने में समस्या हुई।",
    });
  }
};

// PATCH /api/blogs/admin/:id
exports.updateBlog = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid blog ID.",
      });
    }

    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog नहीं मिला।",
      });
    }

    const allowedFields = [
      "title",
      "slug",
      "excerpt",
      "content",
      "categoryId",
      "category",
      "status",
      "isFeatured",
      "tags",
      "coverImage",
      "author",
      "publishedAt",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (updates.title !== undefined) {
      if (typeof updates.title !== "string" || !updates.title.trim()) {
        return res.status(400).json({
          success: false,
          message: "Title खाली नहीं हो सकता।",
        });
      }

      updates.title = updates.title.trim();
    }

    if (updates.slug !== undefined) {
      if (typeof updates.slug !== "string" || !updates.slug.trim()) {
        return res.status(400).json({
          success: false,
          message: "Slug खाली नहीं हो सकता।",
        });
      }

      updates.slug = slugify(updates.slug);

      const duplicate = await Blog.findOne({
        slug: updates.slug,
        _id: { $ne: id },
      }).lean();

      if (duplicate) {
        return res.status(409).json({
          success: false,
          message: "यह slug किसी दूसरे blog में पहले से मौजूद है।",
        });
      }
    }

    if (updates.status !== undefined) {
      if (!["draft", "published", "archived"].includes(updates.status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid blog status.",
        });
      }

      if (updates.status === "published" && !blog.publishedAt) {
        updates.publishedAt = new Date();
      }
    }

    if (updates.categoryId !== undefined && updates.categoryId) {
      if (!mongoose.Types.ObjectId.isValid(updates.categoryId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid category ID.",
        });
      }

      const categoryDoc = await BlogCategory.findById(updates.categoryId);

      if (!categoryDoc) {
        return res.status(400).json({
          success: false,
          message: "Blog category नहीं मिली।",
        });
      }

      updates.categoryId = categoryDoc._id;
      updates.category = categoryDoc.label;
    } else if (updates.category !== undefined && updates.category?.trim()) {
      const categoryDoc = await BlogCategory.findOne({
        $or: [
          { slug: updates.category.trim() },
          {
            label: {
              $regex: `^${escapeRegex(updates.category.trim())}$`,
              $options: "i",
            },
          },
        ],
      });

      if (categoryDoc) {
        updates.categoryId = categoryDoc._id;
        updates.category = categoryDoc.label;
      }
    }

    Object.assign(blog, updates);
    await blog.save();

    return res.status(200).json({
      success: true,
      message: "Blog सफलतापूर्वक update हुआ।",
      data: blog,
    });
  } catch (error) {
    console.error("updateBlog error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "यह slug पहले से मौजूद है।",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Blog update करने में समस्या हुई।",
    });
  }
};

// DELETE /api/blogs/admin/:id
exports.deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid blog ID.",
      });
    }

    const blog = await Blog.findByIdAndDelete(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog नहीं मिला।",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Blog delete हो गया।",
    });
  } catch (error) {
    console.error("deleteBlog error:", error);
    return res.status(500).json({
      success: false,
      message: "Blog delete करने में समस्या हुई।",
    });
  }
};

// PATCH /api/blogs/admin/:id/status
exports.updateBlogStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid blog ID.",
      });
    }

    if (!["draft", "published", "archived"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status draft, published या archived होना चाहिए।",
      });
    }

    const updates = { status };

    if (status === "published") {
      const blog = await Blog.findById(id);

      if (!blog) {
        return res.status(404).json({
          success: false,
          message: "Blog नहीं मिला।",
        });
      }

      if (!blog.publishedAt) {
        updates.publishedAt = new Date();
      }
    }

    const blog = await Blog.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog नहीं मिला।",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Blog status update हो गया।",
      data: blog,
    });
  } catch (error) {
    console.error("updateBlogStatus error:", error);
    return res.status(500).json({
      success: false,
      message: "Blog status update करने में समस्या हुई।",
    });
  }
};

// PATCH /api/blogs/admin/:id/featured
exports.updateBlogFeatured = async (req, res) => {
  try {
    const { id } = req.params;
    const { isFeatured } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid blog ID.",
      });
    }

    if (typeof isFeatured !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isFeatured boolean होना चाहिए।",
      });
    }

    const blog = await Blog.findByIdAndUpdate(
      id,
      { isFeatured },
      { new: true, runValidators: true }
    );

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog नहीं मिला।",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Featured status update हो गया।",
      data: blog,
    });
  } catch (error) {
    console.error("updateBlogFeatured error:", error);
    return res.status(500).json({
      success: false,
      message: "Featured status update करने में समस्या हुई।",
    });
  }
};

// Helpers
function escapeRegex(value = "") {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function slugify(value = "") {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function pickAllowedFields(source = {}) {
  const allowed = [
    "excerpt",
    "content",
    "isFeatured",
    "tags",
    "coverImage",
    "author",
  ];

  const result = {};

  for (const field of allowed) {
    if (source[field] !== undefined) {
      result[field] = source[field];
    }
  }

  return result;
}