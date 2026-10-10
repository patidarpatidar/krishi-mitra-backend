const mongoose = require("mongoose");

const blogCommentSchema = new mongoose.Schema(
  {
    blogId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Blog",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    location: {
      type: String,
      trim: true,
      default: "",
      maxlength: 120,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    answer: {
      type: String,
      trim: true,
      default: "",
      maxlength: 2000,
    },
    answeredAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

blogCommentSchema.index({ blogId: 1, createdAt: -1 });

module.exports =
  mongoose.models.BlogComment ||
  mongoose.model("BlogComment", blogCommentSchema);
