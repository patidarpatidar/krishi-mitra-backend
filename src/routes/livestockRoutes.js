
const express = require("express");

const router = express.Router();

const livestockController = require("../controllers/livestockController");

const {
  createLivestockArticleValidator,
  updateLivestockArticleValidator,
  articleIdValidator,
  slugValidator,
  listLivestockValidator,
  engagementValidator,
} = require("../validators/livestockValidator");

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

// =====================================
// PUBLIC APIs
// =====================================

router.get(
  "/",
  listLivestockValidator,
  livestockController.getPublicArticles
);

router.get(
  "/slug/:slug",
  slugValidator,
  livestockController.getPublicArticleBySlug
);

router.post(
  "/:id/view",
  engagementValidator,
  livestockController.recordView
);

router.post(
  "/:id/like",
  engagementValidator,
  livestockController.likeArticle
);
router.put(
  "/:id/like",
  engagementValidator,
  livestockController.likeArticle
);
router.delete(
  "/:id/like",
  engagementValidator,
  livestockController.likeArticle
);

// =====================================
// ADMIN-ONLY APIs
// =====================================

router.get(
  "/admin",
  protect,
  adminOnly,
  listLivestockValidator,
  livestockController.getAdminArticles
);

router.get(
  "/admin/:id",
  protect,
  adminOnly,
  articleIdValidator,
  livestockController.getAdminArticleById
);

router.post(
  "/admin",
  protect,
  adminOnly,
  createLivestockArticleValidator,
  livestockController.createArticle
);

router.patch(
  "/admin/:id",
  protect,
  adminOnly,
  updateLivestockArticleValidator,
  livestockController.updateArticle
);

router.delete(
  "/admin/:id",
  protect,
  adminOnly,
  articleIdValidator,
  livestockController.deleteArticle
);

module.exports = router;
