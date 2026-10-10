const mongoose = require("mongoose");

const contentEngagementSchema = new mongoose.Schema(
  {
    contentType: {
      type: String,
      enum: ["blog", "crop", "scheme", "organic-recipe"],
      required: true,
    },
    contentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    visitorId: {
      type: String,
      required: true,
      maxlength: 100,
    },
    action: {
      type: String,
      enum: ["view", "like"],
      required: true,
    },
  },
  { timestamps: true }
);

contentEngagementSchema.index(
  { contentType: 1, contentId: 1, visitorId: 1, action: 1 },
  { unique: true }
);

module.exports = mongoose.model("ContentEngagement", contentEngagementSchema);
