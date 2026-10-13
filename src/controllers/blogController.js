
const mongoose = require("mongoose");
const Blog = require("../models/Blog");
const BlogCategory = require("../models/BlogCategory");
const BlogFeedback = require("../models/BlogFeedback");
const BlogComment = require("../models/BlogComment");

const YOUTUBE_VIDEO_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;
const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "m.youtube.com",
  "music.youtube.com",
  "youtube-nocookie.com",
  "youtu.be",
]);

function extractYouTubeVideoId(value) {
  const input = String(value || "").trim();
  if (YOUTUBE_VIDEO_ID_PATTERN.test(input)) return input;
  if (!input) return "";

  let url;
  try {
    url = new URL(/^https?:\/\//i.test(input) ? input : `https://${input}`);
  } catch {
    return "";
  }

  const host = url.hostname.toLowerCase().replace(/^www\./, "");
  if (!YOUTUBE_HOSTS.has(host)) return "";

  const pathParts = url.pathname.split("/").filter(Boolean);
  let videoId = "";
  if (host === "youtu.be") {
    videoId = pathParts[0] || "";
  } else if (url.pathname === "/watch") {
    videoId = url.searchParams.get("v") || "";
  } else {
    const markerIndex = pathParts.findIndex((part) =>
      ["embed", "shorts", "live", "v"].includes(part.toLowerCase())
    );
    if (markerIndex >= 0) videoId = pathParts[markerIndex + 1] || "";
  }

  return YOUTUBE_VIDEO_ID_PATTERN.test(videoId) ? videoId : "";
}

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

const findPublishedBlog = (slug) =>
  Blog.findOne({ slug: slug?.trim(), status: "published" })
    .select("_id")
    .lean();

const getFeedbackVisitorId = (value) =>
  typeof value === "string" && value.length >= 8 && value.length <= 100
    ? value
    : "";

const getFeedbackSummary = async (blogId, visitorId) => {
  const [counts, visitorFeedback] = await Promise.all([
    BlogFeedback.aggregate([
      { $match: { blogId } },
      { $group: { _id: "$rating", count: { $sum: 1 } } },
    ]),
    visitorId
      ? BlogFeedback.findOne({ blogId, visitorId }).select("rating").lean()
      : null,
  ]);
  const totals = { helpful: 0, "needs-improvement": 0 };
  counts.forEach(({ _id, count }) => {
    totals[_id] = count;
  });
  return { ...totals, visitorRating: visitorFeedback?.rating || null };
};

exports.getBlogFeedback = async (req, res) => {
  try {
    const blog = await findPublishedBlog(req.params.slug);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Published blog not found.",
      });
    }

    const visitorId = getFeedbackVisitorId(req.query.visitorId);
    return res.json({
      success: true,
      data: await getFeedbackSummary(blog._id, visitorId),
    });
  } catch (error) {
    console.error("Get blog feedback error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch blog feedback.",
    });
  }
};

exports.submitBlogFeedback = async (req, res) => {
  const { visitorId, rating } = req.body || {};
  if (!getFeedbackVisitorId(visitorId)) {
    return res.status(400).json({
      success: false,
      message: "A valid visitor ID is required.",
    });
  }
  if (!["helpful", "needs-improvement"].includes(rating)) {
    return res.status(400).json({
      success: false,
      message: "Feedback must be helpful or needs-improvement.",
    });
  }

  try {
    const blog = await findPublishedBlog(req.params.slug);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Published blog not found.",
      });
    }

    await BlogFeedback.findOneAndUpdate(
      { blogId: blog._id, visitorId },
      { $set: { rating } },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true },
    );

    return res.json({
      success: true,
      data: await getFeedbackSummary(blog._id, visitorId),
    });
  } catch (error) {
    console.error("Submit blog feedback error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to save blog feedback.",
    });
  }
};

exports.getBlogComments = async (req, res) => {
  try {
    const blog = await findPublishedBlog(req.params.slug);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Published blog not found.",
      });
    }

    const [comments, count] = await Promise.all([
      BlogComment.find({ blogId: blog._id })
        .sort({ createdAt: -1 })
        .limit(100)
        .lean(),
      BlogComment.countDocuments({ blogId: blog._id }),
    ]);

    return res.json({
      success: true,
      data: comments,
      count,
    });
  } catch (error) {
    console.error("Get blog comments error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch blog comments.",
    });
  }
};

exports.createBlogComment = async (req, res) => {
  const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
  const location =
    typeof req.body?.location === "string" ? req.body.location.trim() : "";
  const text = typeof req.body?.text === "string" ? req.body.text.trim() : "";

  if (!name || name.length > 100 || location.length > 120 || !text || text.length > 2000) {
    return res.status(400).json({
      success: false,
      message: "Name and a comment of up to 2000 characters are required.",
    });
  }

  try {
    const blog = await findPublishedBlog(req.params.slug);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Published blog not found.",
      });
    }

    const comment = await BlogComment.create({
      blogId: blog._id,
      name,
      location,
      text,
    });
    try {
      await Blog.updateOne({ _id: blog._id }, { $inc: { comments: 1 } });
    } catch (counterError) {
      console.error("Update blog comment count error:", counterError);
    }

    return res.status(201).json({
      success: true,
      message: "Comment submitted successfully.",
      data: comment,
    });
  } catch (error) {
    console.error("Create blog comment error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to submit the comment.",
    });
  }
};

exports.getAdminBlogComments = async (req, res) => {
  try {
    const comments = await BlogComment.find()
      .populate("blogId", "title slug")
      .sort({ createdAt: -1 })
      .limit(500)
      .lean();
    return res.json({ success: true, data: comments, count: comments.length });
  } catch (error) {
    console.error("Get admin blog comments error:", error);
    return res.status(500).json({ success: false, message: "Unable to fetch blog comments." });
  }
};

exports.answerBlogComment = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ success: false, message: "Invalid comment ID." });
  }
  const answer = typeof req.body?.answer === "string" ? req.body.answer.trim() : "";
  if (!answer || answer.length > 2000) {
    return res.status(400).json({
      success: false,
      message: "An answer of up to 2000 characters is required.",
    });
  }

  try {
    const comment = await BlogComment.findByIdAndUpdate(
      req.params.id,
      { $set: { answer, answeredAt: new Date() } },
      { new: true, runValidators: true },
    ).populate("blogId", "title slug");
    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found." });
    }
    return res.json({ success: true, data: comment });
  } catch (error) {
    console.error("Answer blog comment error:", error);
    return res.status(500).json({ success: false, message: "Unable to save the answer." });
  }
};

exports.deleteBlogComment = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ success: false, message: "Invalid comment ID." });
  }
  try {
    const comment = await BlogComment.findByIdAndDelete(req.params.id);
    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found." });
    }
    const commentCount = await BlogComment.countDocuments({ blogId: comment.blogId });
    await Blog.updateOne({ _id: comment.blogId }, { $set: { comments: commentCount } });
    return res.json({ success: true, message: "Comment deleted." });
  } catch (error) {
    console.error("Delete blog comment error:", error);
    return res.status(500).json({ success: false, message: "Unable to delete the comment." });
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
    const youtubeVideoId = extractYouTubeVideoId(allowedFields.youtubeVideoId);
    if (allowedFields.hasVideo && !youtubeVideoId) {
      return res.status(400).json({
        success: false,
        message: "वीडियो चालू करने के लिए सही YouTube URL या Video ID जरूरी है।",
      });
    }
    allowedFields.youtubeVideoId = youtubeVideoId;

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
      "authorRole",
      "authorAvatar",
      "readTime",
      "date",
      "hasVideo",
      "youtubeVideoId",
      "hasGallery",
      "galleryImages",
      "calculator",
      "seo",
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

    if (updates.hasVideo !== undefined || updates.youtubeVideoId !== undefined) {
      const videoEnabled = updates.hasVideo ?? blog.hasVideo;
      const videoInput = updates.youtubeVideoId ?? blog.youtubeVideoId;
      const youtubeVideoId = extractYouTubeVideoId(videoInput);
      if (videoEnabled && !youtubeVideoId) {
        return res.status(400).json({
          success: false,
          message: "वीडियो चालू करने के लिए सही YouTube URL या Video ID जरूरी है।",
        });
      }
      updates.youtubeVideoId = youtubeVideoId;
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