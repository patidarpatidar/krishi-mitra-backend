
const express = require("express");
const router = express.Router();

const blogController = require("../controllers/blogController");
const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

// Public endpoints
router.get("/", blogController.getBlogs);
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