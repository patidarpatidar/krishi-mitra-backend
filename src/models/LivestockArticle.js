
const mongoose = require("mongoose");

const livestockSectionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    points: { type: [String], default: [] },
  },
  { _id: false }
);

const livestockFaqSchema = new mongoose.Schema(
  {
    q: { type: String, required: true, trim: true },
    a: { type: String, required: true },
  },
  { _id: false }
);

const livestockArticleSchema = new mongoose.Schema(
  {
    title: {
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
    subtitle: { type: String, default: "" },
    category: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    categoryLabel: { type: String, default: "" },
    image: { type: String, default: "" },
    intro: { type: String, default: "" },

    facts: {
      type: [[String]],
      default: [],
    },

    sections: {
      type: [livestockSectionSchema],
      default: [],
    },

    faqs: {
      type: [livestockFaqSchema],
      default: [],
    },

    readTime: { type: String, default: "5 मिनट" },
    updatedLabel: { type: String, default: "" },

    metaTitle: { type: String, default: "" },
    metaDescription: { type: String, default: "" },
    keywords: { type: [String], default: [] },

    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
      index: true,
    },

    featured: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },

    viewsCount: { type: Number, default: 0, min: 0 },
    likesCount: { type: Number, default: 0, min: 0 },

    author: { type: String, default: "Kisan Mitra" },
    publishedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

livestockArticleSchema.index({
  status: 1,
  category: 1,
  featured: -1,
  sortOrder: 1,
  publishedAt: -1,
});

module.exports = mongoose.model(
  "LivestockArticle",
  livestockArticleSchema
);