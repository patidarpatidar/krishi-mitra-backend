const mongoose = require("mongoose");

const varietySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    yield: {
      type: String,
      trim: true,
    },

    feature: {
      type: String,
      trim: true,
    },
  },
  { _id: true }
);

const diseaseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    symptoms: {
      type: String,
      trim: true,
    },

    solution: {
      type: String,
      trim: true,
    },
  },
  { _id: true }
);

const seoSchema = new mongoose.Schema(
  {
    metaTitle: {
      type: String,
      trim: true,
      maxlength: 70,
    },

    metaDescription: {
      type: String,
      trim: true,
      maxlength: 160,
    },

    keywords: {
      type: [String],
      default: [],
    },

    focusKeyword: {
      type: String,
      trim: true,
    },

    canonicalUrl: {
      type: String,
      trim: true,
    },

    ogTitle: {
      type: String,
      trim: true,
    },

    ogDescription: {
      type: String,
      trim: true,
    },

    ogImage: {
      type: String,
      trim: true,
    },

    twitterTitle: {
      type: String,
      trim: true,
    },

    twitterDescription: {
      type: String,
      trim: true,
    },

    twitterImage: {
      type: String,
      trim: true,
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
  { _id: false }
);

const cropSchema = new mongoose.Schema(
  {
    // --------------------------------
    // BASIC INFORMATION
    // --------------------------------

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    englishName: {
      type: String,
      required: true,
      trim: true,
    },

    scientificName: {
      type: String,
      trim: true,
    },

    icon: {
      type: String,
      default: "🌱",
      trim: true,
    },

    // --------------------------------
    // CATEGORY
    // --------------------------------

    category: {
      key: {
        type: String,
        required: true,
        trim: true,
        index: true,
      },

      label: {
        type: String,
        required: true,
        trim: true,
      },
    },

    // --------------------------------
    // SEASON
    // --------------------------------

    season: {
      key: {
        type: String,
        required: true,
        trim: true,
        index: true,
      },

      label: {
        type: String,
        required: true,
        trim: true,
      },
    },

    // --------------------------------
    // CROP TYPE
    // --------------------------------

    cropType: {
      key: {
        type: String,
        trim: true,
      },

      label: {
        type: String,
        trim: true,
      },
    },

    // --------------------------------
    // SUMMARY
    // --------------------------------

    description: {
      type: String,
      required: true,
      trim: true,
    },

    idealSoil: {
      type: String,
      trim: true,
    },

    duration: {
      type: String,
      trim: true,
    },

    durationDays: {
      type: Number,
    },

    sowing: {
      type: String,
      trim: true,
    },

    seedRate: {
      type: String,
      trim: true,
    },

    water: {
      key: {
        type: String,
        trim: true,
      },

      label: {
        type: String,
        trim: true,
      },
    },

    // --------------------------------
    // REGIONS
    // --------------------------------

    regions: {
      type: [String],
      default: [],
    },

    regionLabel: {
      type: String,
      trim: true,
    },

    // --------------------------------
    // DETAILED CONTENT
    // --------------------------------

    overview: {
      type: String,
      trim: true,
    },

    author: {
      type: String,
      default: "किसान मित्र टीम",
      trim: true,
    },

    publishedAt: {
      type: Date,
    },

    updatedAtContent: {
      type: Date,
    },

    readTime: {
      type: String,
      trim: true,
    },

    soilRequirement: {
      type: String,
      trim: true,
    },

    sowingTime: {
      type: String,
      trim: true,
    },

    waterRequirement: {
      type: String,
      trim: true,
    },

    harvestingTime: {
      type: String,
      trim: true,
    },

    topDemandMandi: {
      type: String,
      trim: true,
    },

    // --------------------------------
    // VARIETIES
    // --------------------------------

    varieties: {
      type: [varietySchema],
      default: [],
    },

    // --------------------------------
    // DISEASES / PESTS
    // --------------------------------

    diseases: {
      type: [diseaseSchema],
      default: [],
    },

    // --------------------------------
    // TAGS
    // --------------------------------

    tags: {
      type: [String],
      default: [],
    },

    // --------------------------------
    // SEO
    // --------------------------------

    seo: {
      type: seoSchema,
      default: () => ({}),
    },

    // --------------------------------
    // PUBLISHING
    // --------------------------------

    featured: {
      type: Boolean,
      default: false,
      index: true,
    },

    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
      index: true,
    },

    // --------------------------------
    // ANALYTICS
    // --------------------------------

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
  },
  {
    timestamps: true,
  }
);

cropSchema.index({
  name: "text",
  englishName: "text",
  description: "text",
  overview: "text",
  tags: "text",
});

module.exports = mongoose.model("Crop", cropSchema);