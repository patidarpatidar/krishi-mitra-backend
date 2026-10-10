const mongoose = require("mongoose");

const cropQuestionSchema = new mongoose.Schema(
  {
    cropId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Crop",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    question: {
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

cropQuestionSchema.index({ cropId: 1, createdAt: -1 });

module.exports =
  mongoose.models.CropQuestion ||
  mongoose.model("CropQuestion", cropQuestionSchema);
