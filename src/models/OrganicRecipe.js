const mongoose = require("mongoose");

const ingredientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    unit: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    _id: false,
  }
);

const seoSchema = new mongoose.Schema(
  {
    metaTitle: {
      type: String,
      trim: true,
      default: "",
      maxlength: 60,
    },

    metaDescription: {
      type: String,
      trim: true,
      default: "",
      maxlength: 160,
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

const organicRecipeSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    titleEn: {
      type: String,
      trim: true,
      default: "",
    },

    type: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      enum: ["fertilizer", "pesticide", "fungicide"],
      index: true,
    },

    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OrganicCategory",
      default: null,
      index: true,
    },

    categorySlug: {
      type: String,
      trim: true,
      default: "",
      index: true,
    },

    target: {
      type: String,
      required: true,
      trim: true,
    },

    shelfLife: {
      type: String,
      trim: true,
      default: "",
    },

    costMin: {
      type: Number,
      min: 0,
      default: 0,
    },

    costMax: {
      type: Number,
      min: 0,
      default: 0,
    },

    baseArea: {
      type: Number,
      required: true,
      min: 0,
      default: 1,
    },

    baseAreaUnit: {
      type: String,
      enum: ["acre", "hectare", "bigha"],
      default: "acre",
    },

    baseWater: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    baseWaterUnit: {
      type: String,
      default: "लीटर",
      trim: true,
    },

    baseIngredients: {
      type: [ingredientSchema],
      default: [],
    },

    processSteps: {
      type: [String],
      default: [],
    },

    usage: {
      type: String,
      trim: true,
      default: "",
    },

    precautions: {
      type: String,
      trim: true,
      default: "",
    },

    coverImage: {
      type: String,
      trim: true,
      default: "",
    },

    shortDescription: {
      type: String,
      trim: true,
      default: "",
    },

    seo: {
      type: seoSchema,
      default: () => ({}),
    },

    featured: {
      type: Boolean,
      default: false,
      index: true,
    },

    status: {
      type: String,
      enum: ["active", "inactive", "draft", "archived"],
      default: "draft",
      index: true,
    },

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

organicRecipeSchema.index({
  title: "text",
  titleEn: "text",
  type: "text",
  target: "text",
  category: "text",
  "seo.focusKeyword": "text",
});

organicRecipeSchema.index({
  status: 1,
  featured: 1,
  category: 1,
});

module.exports = mongoose.model(
  "OrganicRecipe",
  organicRecipeSchema
);