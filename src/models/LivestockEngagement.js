
const mongoose = require("mongoose");

const livestockEngagementSchema = new mongoose.Schema(
  {
    articleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LivestockArticle",
      required: true,
      index: true,
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

livestockEngagementSchema.index(
  { articleId: 1, visitorId: 1, action: 1 },
  { unique: true }
);

module.exports = mongoose.model(
  "LivestockEngagement",
  livestockEngagementSchema
);