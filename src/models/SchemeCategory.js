const mongoose = require("mongoose");

const schemeCategorySchema = new mongoose.Schema(
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
      index: true,
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    icon: {
      type: String,
      trim: true,
      default: "🏛️",
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
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "SchemeCategory",
  schemeCategorySchema
);