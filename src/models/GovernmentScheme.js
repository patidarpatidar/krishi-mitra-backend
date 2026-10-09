const mongoose = require("mongoose");

// =========================================================
// SUB SCHEMAS
// =========================================================

const importantLinkSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    url: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    _id: false,
  }
);

// =========================================================
// SEO SCHEMA
// =========================================================

const seoSchema = new mongoose.Schema(
  {
    metaTitle: {
      type: String,
      trim: true,
      default: "",
    },

    metaDescription: {
      type: String,
      trim: true,
      default: "",
    },

    keywords: {
      type: [String],
      default: [],
    },

    focusKeyword: {
      type: String,
      trim: true,
      default: "",
    },

    canonicalUrl: {
      type: String,
      trim: true,
      default: "",
    },

    ogTitle: {
      type: String,
      trim: true,
      default: "",
    },

    ogDescription: {
      type: String,
      trim: true,
      default: "",
    },

    ogImage: {
      type: String,
      trim: true,
      default: "",
    },

    twitterTitle: {
      type: String,
      trim: true,
      default: "",
    },

    twitterDescription: {
      type: String,
      trim: true,
      default: "",
    },

    twitterImage: {
      type: String,
      trim: true,
      default: "",
    },

    schemaType: {
      type: String,
      default: "Article",
      trim: true,
    },

    allowIndex: {
      type: Boolean,
      default: true,
    },

    allowFollow: {
      type: Boolean,
      default: true,
    },
  },
  {
    _id: false,
  }
);

// =========================================================
// GOVERNMENT SCHEME SCHEMA
// =========================================================

const governmentSchemeSchema = new mongoose.Schema(
  {
    // =====================================================
    // EXISTING WEBSITE ID
    // Example: pm-kisan
    // =====================================================

    id: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    // =====================================================
    // SLUG
    // =====================================================

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    // =====================================================
    // BASIC INFORMATION
    // =====================================================

    name: {
      type: String,
      required: true,
      trim: true,
    },

    shortName: {
      type: String,
      required: true,
      trim: true,
    },

    level: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    government: {
      type: String,
      required: true,
      trim: true,
    },

    department: {
      type: String,
      required: true,
      trim: true,
    },

    // =====================================================
    // CATEGORY
    // =====================================================

    // Keep exact current website field
    // Example: "किसान सहायता"
    category: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    // Relation with SchemeCategory collection
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SchemeCategory",
      default: null,
      index: true,
    },

    // Useful for filtering without depending on Hindi name
    categorySlug: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
      index: true,
    },

    // =====================================================
    // ICON
    // =====================================================

    icon: {
      type: String,
      required: true,
      trim: true,
    },

    // =====================================================
    // DESCRIPTION
    // =====================================================

    description: {
      type: String,
      required: true,
      trim: true,
    },

    // =====================================================
    // BENEFITS
    // =====================================================

    benefits: {
      type: [String],
      default: [],
    },

    // =====================================================
    // ELIGIBILITY
    // =====================================================

    eligibility: {
      type: [String],
      default: [],
    },

    // =====================================================
    // DOCUMENTS
    // =====================================================

    documents: {
      type: [String],
      default: [],
    },

    // =====================================================
    // HOW TO APPLY
    // =====================================================

    howToApply: {
      type: [String],
      default: [],
    },

    // =====================================================
    // IMPORTANT LINKS
    // =====================================================

    importantLinks: {
      type: [importantLinkSchema],
      default: [],
    },

    // =====================================================
    // SOURCE INFORMATION
    // =====================================================

    sourceName: {
      type: String,
      required: true,
      trim: true,
    },

    sourceUrl: {
      type: String,
      required: true,
      trim: true,
    },

    // =====================================================
    // HELPLINE
    // =====================================================

    helpline: {
      type: String,
      default: null,
      trim: true,
    },

    // =====================================================
    // VERIFICATION
    // =====================================================

    lastVerifiedAt: {
      type: String,
      default: "",
      trim: true,
    },

    // =====================================================
    // TAGS
    // =====================================================

    tags: {
      type: [String],
      default: [],
    },

    // =====================================================
    // SEO
    // =====================================================

    seo: {
      type: seoSchema,
      default: () => ({}),
    },

    // =====================================================
    // PUBLISHING
    // =====================================================

    featured: {
      type: Boolean,
      default: false,
      index: true,
    },

    status: {
      type: String,
      enum: [
        "active",
        "inactive",
        "draft",
        "archived",
      ],
      default: "draft",
      index: true,
    },

    // =====================================================
    // ANALYTICS
    // =====================================================

    views: {
      type: Number,
      default: 0,
      min: 0,
    },

    likes: {
      type: Number,
      default: 0,
      min: 0,
    },

    // =====================================================
    // DATES
    // =====================================================

    publishedAt: {
      type: Date,
      default: null,
    },

    updatedAtContent: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// =========================================================
// INDEXES
// =========================================================

// Search index
governmentSchemeSchema.index({
  name: "text",
  shortName: "text",
  description: "text",
  category: "text",
  government: "text",
  department: "text",
  tags: "text",
});

// Common filtering
governmentSchemeSchema.index({
  status: 1,
  featured: 1,
});

governmentSchemeSchema.index({
  categorySlug: 1,
  status: 1,
});

governmentSchemeSchema.index({
  level: 1,
  status: 1,
});

// =========================================================
// EXPORT
// =========================================================

module.exports = mongoose.model(
  "GovernmentScheme",
  governmentSchemeSchema
);