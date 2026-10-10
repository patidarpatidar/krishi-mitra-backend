const mongoose = require("mongoose");

const blogFeedbackSchema = new mongoose.Schema(
  {
    blogId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Blog",
      required: true,
      index: true,
    },
    visitorId: {
      type: String,
      required: true,
      trim: true,
      minlength: 8,
      maxlength: 100,
    },
    rating: {
      type: String,
      enum: ["helpful", "needs-improvement"],
      required: true,
    },
  },
  { timestamps: true },
);

blogFeedbackSchema.index({ blogId: 1, visitorId: 1 }, { unique: true });

module.exports =
  mongoose.models.BlogFeedback ||
  mongoose.model("BlogFeedback", blogFeedbackSchema);
