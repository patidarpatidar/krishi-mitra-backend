const Crop = require("../models/Crop");
const Blog = require("../models/Blog");
const GovernmentScheme = require("../models/GovernmentScheme");
const OrganicRecipe = require("../models/OrganicRecipe");
const LivestockArticle = require("../models/LivestockArticle");

const aggregateCounts = async (model, viewField = "views", likeField = "likes") => {
  const [result] = await model.aggregate([
    {
      $group: {
        _id: null,
        views: { $sum: { $ifNull: [`$${viewField}`, 0] } },
        likes: { $sum: { $ifNull: [`$${likeField}`, 0] } },
      },
    },
  ]);

  return { views: result?.views || 0, likes: result?.likes || 0 };
};

exports.getContentAnalytics = async (req, res, next) => {
  try {
    const totals = await Promise.all([
      aggregateCounts(Crop),
      aggregateCounts(Blog),
      aggregateCounts(GovernmentScheme),
      aggregateCounts(OrganicRecipe),
      aggregateCounts(LivestockArticle, "viewsCount", "likesCount"),
    ]);

    return res.json({
      success: true,
      data: {
        views: totals.reduce((sum, item) => sum + item.views, 0),
        likes: totals.reduce((sum, item) => sum + item.likes, 0),
      },
    });
  } catch (error) {
    return next(error);
  }
};
