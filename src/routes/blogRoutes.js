
const express = require("express");
const router = express.Router();

const blogController = require("../controllers/blogController");
const Blog = require("../models/Blog");
const {
  createContentEngagementHandlers,
} = require("../controllers/contentEngagementController");
const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");
const blogEngagement = createContentEngagementHandlers(Blog, "blog");

// Public endpoints
router.get("/", blogController.getBlogs);
router.post("/:id/view", blogEngagement.recordView);
router.put("/:id/like", blogEngagement.setLike);
router.delete("/:id/like", blogEngagement.setLike);
router.get("/admin/comments", protect, adminOnly, blogController.getAdminBlogComments);
router.patch("/admin/comments/:id/answer", protect, adminOnly, blogController.answerBlogComment);
router.delete("/admin/comments/:id", protect, adminOnly, blogController.deleteBlogComment);
router.get("/slug/:slug/feedback", blogController.getBlogFeedback);
router.post("/slug/:slug/feedback", blogController.submitBlogFeedback);
router.get("/slug/:slug/comments", blogController.getBlogComments);
router.post("/slug/:slug/comments", blogController.createBlogComment);
router.get("/slug/:slug", blogController.getBlogBySlug);

// Admin endpoints
router.get(
  "/admin",
  protect,
  adminOnly,
  blogController.getBlogs
);

router.get(
  "/admin/:id",
  protect,
  adminOnly,
  blogController.getBlogById
);

router.post(
  "/admin",
  protect,
  adminOnly,
  blogController.createBlog
);

router.patch(
  "/admin/:id",
  protect,
  adminOnly,
  blogController.updateBlog
);

router.delete(
  "/admin/:id",
  protect,
  adminOnly,
  blogController.deleteBlog
);

router.patch(
  "/admin/:id/status",
  protect,
  adminOnly,
  blogController.updateBlogStatus
);

router.patch(
  "/admin/:id/featured",
  protect,
  adminOnly,
  blogController.updateBlogFeatured
);

module.exports = router;