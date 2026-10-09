
const mongoose = require("mongoose");

const paragraphSectionSchema = new mongoose.Schema(
  {
    id: { type: String, trim: true, default: "" },
    title: { type: String, required: true, trim: true },
    paragraphs: [{ type: String, trim: true }],
    bullets: [{ type: String, trim: true }],
  },
  { _id: false }
);

const faqSchema = new mongoose.Schema(
  {
    question: { type: String, required: true, trim: true },
    answer: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const galleryImageSchema = new mongoose.Schema(
  {
    url: { type: String, trim: true, default: "" },
    title: { type: String, trim: true, default: "" },
  },
  { _id: false }
);

const recommendationSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, default: "" },
    type: { type: String, trim: true, default: "" },
    quantity: { type: Number, min: 0, default: 0 },
    unit: { type: String, trim: true, default: "" },
    note: { type: String, trim: true, default: "" },
  },
  { _id: false }
);

const calculatorSchema = new mongoose.Schema(
  {
    enabled: { type: Boolean, default: false },
    waterPerAcre: { type: Number, min: 0, default: 0 },
    recommendations: {
      type: [recommendationSchema],
      default: [],
    },
  },
  { _id: false }
);

const seoSchema = new mongoose.Schema(
  {
    metaTitle: { type: String, trim: true, maxlength: 60, default: "" },
    metaDescription: {
      type: String,
      trim: true,
      maxlength: 160,
      default: "",
    },
    keywords: [{ type: String, trim: true }],
    focusKeyword: { type: String, trim: true, default: "" },
    canonicalUrl: { type: String, trim: true, default: "" },
    ogTitle: { type: String, trim: true, default: "" },
    ogDescription: { type: String, trim: true, default: "" },
    ogImage: { type: String, trim: true, default: "" },
    twitterTitle: { type: String, trim: true, default: "" },
    twitterDescription: { type: String, trim: true, default: "" },
    twitterImage: { type: String, trim: true, default: "" },
    schemaType: { type: String, default: "Article" },
    allowIndex: { type: Boolean, default: true },
    allowFollow: { type: Boolean, default: true },
  },
  { _id: false }
);

const blogSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 250,
    },

    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BlogCategory",
      default: null,
      index: true,
    },

    // Retain the existing public JSON category label.
    category: { type: String, required: true, trim: true },

    date: { type: Date, default: Date.now },
    author: { type: String, trim: true, default: "" },
    authorRole: { type: String, trim: true, default: "" },
    authorAvatar: { type: String, trim: true, default: "👨‍🌾" },

    readTime: { type: Number, min: 0, default: 1 },
    views: { type: Number, min: 0, default: 0 },
    likes: { type: Number, min: 0, default: 0 },
    comments: { type: Number, min: 0, default: 0 },

    hasVideo: { type: Boolean, default: false },
    hasGallery: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },

    coverImage: { type: String, trim: true, default: "" },
    excerpt: { type: String, trim: true, default: "" },
    tags: [{ type: String, trim: true }],

    content: {
      introduction: { type: String, default: "" },
      sections: {
        type: [paragraphSectionSchema],
        default: [],
      },
      safetyNote: { type: String, default: "" },
      faqs: { type: [faqSchema], default: [] },
    },

    galleryImages: {
      type: [galleryImageSchema],
      default: [],
    },

    youtubeVideoId: { type: String, trim: true, default: "" },

    calculator: {
      type: calculatorSchema,
      default: () => ({ enabled: false }),
    },

    seo: {
      type: seoSchema,
      default: () => ({}),
    },

    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
      index: true,
    },

    publishedAt: { type: Date, default: null },
    updatedAtContent: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

blogSchema.index({ title: "text", excerpt: "text", tags: "text" });
blogSchema.index({ status: 1, date: -1 });
blogSchema.index({ categoryId: 1, status: 1 });
blogSchema.index({ isFeatured: 1, status: 1 });

module.exports = mongoose.model("Blog", blogSchema);