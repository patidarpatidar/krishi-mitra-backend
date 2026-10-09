
const express = require("express");

const router = express.Router();

const inquiryController = require("../controllers/inquiryController");

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

// Public contact form
router.post("/", inquiryController.createInquiry);

// Admin-only APIs
router.get(
  "/",
  protect,
  adminOnly,
  inquiryController.getInquiries
);

router.get(
  "/:id",
  protect,
  adminOnly,
  inquiryController.getInquiryById
);

router.patch(
  "/:id",
  protect,
  adminOnly,
  inquiryController.updateInquiry
);

router.delete(
  "/:id",
  protect,
  adminOnly,
  inquiryController.deleteInquiry
);

module.exports = router;