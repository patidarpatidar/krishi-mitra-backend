const mongoose = require("mongoose");

const livestockCategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 100,
      index: true,
    },
    icon: { type: String, trim: true, default: "🐄", maxlength: 16 },
    description: { type: String, trim: true, default: "", maxlength: 500 },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      index: true,
    },
    sortOrder: { type: Number, min: 0, default: 0 },
  },
  { timestamps: true }
);

livestockCategorySchema.index({ status: 1, sortOrder: 1, name: 1 });

module.exports = mongoose.model("LivestockCategory", livestockCategorySchema);