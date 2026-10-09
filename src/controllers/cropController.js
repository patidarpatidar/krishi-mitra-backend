const mongoose = require("mongoose");
const Crop = require("../models/Crop");

// GET /api/crops
const getCrops = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      category,
      season,
      status,
      featured,
    } = req.query;

    const filter = {};

    if (category) {
      filter["category.key"] = category;
    }

    if (season) {
      filter["season.key"] = season;
    }

    if (status) {
      filter.status = status;
    }

    if (featured !== undefined) {
      filter.featured = featured === "true";
    }

    if (search) {
      filter.$text = {
        $search: search,
      };
    }

    const pageNumber = Math.max(Number(page), 1);
    const limitNumber = Math.min(Math.max(Number(limit), 1), 100);

    const skip = (pageNumber - 1) * limitNumber;

    const [crops, total] = await Promise.all([
      Crop.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber),

      Crop.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: crops,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        totalPages: Math.ceil(total / limitNumber),
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/crops/:id
const getCropById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid crop ID",
      });
    }

    const crop = await Crop.findById(id);

    if (!crop) {
      return res.status(404).json({
        success: false,
        message: "Crop not found",
      });
    }

    res.json({
      success: true,
      data: crop,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/crops/slug/:slug
const getCropBySlug = async (req, res, next) => {
  try {
    const crop = await Crop.findOne({
      slug: req.params.slug.toLowerCase(),
    });

    if (!crop) {
      return res.status(404).json({
        success: false,
        message: "Crop not found",
      });
    }

    res.json({
      success: true,
      data: crop,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/crops
const createCrop = async (req, res, next) => {
  try {
    const existingCrop = await Crop.findOne({
      slug: req.body.slug,
    });

    if (existingCrop) {
      return res.status(409).json({
        success: false,
        message: "Crop with this slug already exists",
      });
    }

    const crop = await Crop.create(req.body);

    res.status(201).json({
      success: true,
      message: "Crop created successfully",
      data: crop,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/crops/:id
const updateCrop = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid crop ID",
      });
    }

    const crop = await Crop.findById(id);

    if (!crop) {
      return res.status(404).json({
        success: false,
        message: "Crop not found",
      });
    }

    if (
      req.body.slug &&
      req.body.slug !== crop.slug
    ) {
      const slugExists = await Crop.findOne({
        slug: req.body.slug,
        _id: { $ne: id },
      });

      if (slugExists) {
        return res.status(409).json({
          success: false,
          message: "Slug already exists",
        });
      }
    }

    Object.assign(crop, req.body);

    const updatedCrop = await crop.save();

    res.json({
      success: true,
      message: "Crop updated successfully",
      data: updatedCrop,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/crops/:id
const deleteCrop = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid crop ID",
      });
    }

    const crop = await Crop.findByIdAndDelete(id);

    if (!crop) {
      return res.status(404).json({
        success: false,
        message: "Crop not found",
      });
    }

    res.json({
      success: true,
      message: "Crop deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/crops/:id/status
const updateCropStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["draft", "published", "archived"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const crop = await Crop.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!crop) {
      return res.status(404).json({
        success: false,
        message: "Crop not found",
      });
    }

    res.json({
      success: true,
      message: "Crop status updated",
      data: crop,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/crops/:id/featured
const updateCropFeatured = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { featured } = req.body;

    const crop = await Crop.findByIdAndUpdate(
      id,
      { featured: Boolean(featured) },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!crop) {
      return res.status(404).json({
        success: false,
        message: "Crop not found",
      });
    }

    res.json({
      success: true,
      message: "Featured status updated",
      data: crop,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCrops,
  getCropById,
  getCropBySlug,
  createCrop,
  updateCrop,
  deleteCrop,
  updateCropStatus,
  updateCropFeatured,
};