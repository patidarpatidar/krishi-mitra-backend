const mongoose = require("mongoose");

const cropCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    icon: {
      type: String,
      trim: true,
      default: "🌱",
      maxlength: 16,
    },

    sortOrder: {
      type: Number,
      min: 0,
      default: 0,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },

    description: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "CropCategory",
  cropCategorySchema
);