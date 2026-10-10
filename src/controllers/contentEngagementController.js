const mongoose = require("mongoose");
const ContentEngagement = require("../models/ContentEngagement");

const getVisitorId = (req) => {
  const visitorId = req.body?.visitorId || req.headers["x-visitor-id"];

  if (
    typeof visitorId !== "string" ||
    visitorId.length < 8 ||
    visitorId.length > 100
  ) {
    return null;
  }

  return visitorId;
};

const getCounts = async (
  model,
  contentId,
  publicStatuses,
  viewsField,
  likesField
) => {
  const content = await model
    .findOne({ _id: contentId, status: { $in: publicStatuses } })
    .select(`${viewsField} ${likesField}`)
    .lean();

  return content
    ? {
        views: Number(content[viewsField]) || 0,
        likes: Number(content[likesField]) || 0,
      }
    : null;
};

const createContentEngagementHandlers = (
  model,
  contentType,
  {
    publicStatuses = ["published"],
    viewsField = "views",
    likesField = "likes",
  } = {}
) => {
  const findPublishedContent = (contentId) =>
    model
      .findOne({ _id: contentId, status: { $in: publicStatuses } })
      .select("_id")
      .lean();

  const recordView = async (req, res, next) => {
    const { id } = req.params;
    const visitorId = getVisitorId(req);

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid content ID" });
    }

    if (!visitorId) {
      return res.status(400).json({
        success: false,
        message: "A valid visitorId is required",
      });
    }

    const filter = { contentType, contentId: id, visitorId, action: "view" };

    try {
      const content = await findPublishedContent(id);
      if (!content) {
        return res.status(404).json({
          success: false,
          message: "Published content not found",
        });
      }

      try {
        await ContentEngagement.create(filter);
        await model.updateOne(
          { _id: id, status: { $in: publicStatuses } },
          { $inc: { [viewsField]: 1 } }
        );
      } catch (error) {
        if (error.code !== 11000) throw error;
      }
    } catch (error) {
      if (error.code !== 11000) return next(error);
    }

    try {
      const counts = await getCounts(
        model,
        id,
        publicStatuses,
        viewsField,
        likesField
      );
      if (!counts) {
        return res.status(404).json({
          success: false,
          message: "Published content not found",
        });
      }

      const liked = await ContentEngagement.exists({
        contentType,
        contentId: id,
        visitorId,
        action: "like",
      });

      return res.json({
        success: true,
        data: { ...counts, liked: Boolean(liked) },
      });
    } catch (error) {
      return next(error);
    }
  };

  const setLike = async (req, res, next) => {
    const { id } = req.params;
    const visitorId = getVisitorId(req);

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid content ID" });
    }

    if (!visitorId) {
      return res.status(400).json({
        success: false,
        message: "A valid visitorId is required",
      });
    }

    const filter = { contentType, contentId: id, visitorId, action: "like" };
    const shouldLike = req.method === "PUT";

    try {
      const content = await findPublishedContent(id);
      if (!content) {
        return res.status(404).json({
          success: false,
          message: "Published content not found",
        });
      }

      if (shouldLike) {
        try {
          await ContentEngagement.create(filter);
          await model.updateOne(
            { _id: id, status: { $in: publicStatuses } },
            { $inc: { [likesField]: 1 } }
          );
        } catch (error) {
          if (error.code !== 11000) throw error;
        }
      } else {
        const result = await ContentEngagement.deleteOne(filter);
        if (result.deletedCount > 0) {
          await model.updateOne(
            { _id: id, status: { $in: publicStatuses } },
            { $inc: { [likesField]: -1 } }
          );
        }
      }

      const counts = await getCounts(
        model,
        id,
        publicStatuses,
        viewsField,
        likesField
      );
      if (!counts) {
        return res.status(404).json({
          success: false,
          message: "Published content not found",
        });
      }

      return res.json({
        success: true,
        data: { ...counts, liked: shouldLike },
      });
    } catch (error) {
      return next(error);
    }
  };

  return { recordView, setLike };
};

module.exports = { createContentEngagementHandlers };
