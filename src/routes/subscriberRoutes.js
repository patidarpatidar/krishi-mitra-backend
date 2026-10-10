const express = require("express");
const subscriberController = require("../controllers/subscriberController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", subscriberController.createSubscriber);
router.get("/", protect, adminOnly, subscriberController.getSubscribers);
router.patch("/:id", protect, adminOnly, subscriberController.updateSubscriber);
router.delete("/:id", protect, adminOnly, subscriberController.deleteSubscriber);

module.exports = router;
