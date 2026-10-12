const mongoose = require("mongoose");
const SchemeCategory = require("../models/SchemeCategory");
const GovernmentScheme = require("../models/GovernmentScheme");

// =========================================================
// GET ALL CATEGORIES
// GET /api/scheme-categories
// =========================================================

const getCategories = async (req, res, next) => {
  try {
    const { status, search } = req.query;

    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        {
          name: {
            $regex: search,
            $options: "i",
          },
        },
        {
          slug: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    const categories = await SchemeCategory.find(filter)
      .sort({ sortOrder: 1, name: 1 })
      .lean();

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// GET CATEGORY BY ID
// GET /api/scheme-categories/:id
// =========================================================

const getCategoryById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    const category = await SchemeCategory.findById(id).lean();

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Scheme category not found",
      });
    }

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// CREATE CATEGORY
// POST /api/scheme-categories
// =========================================================

const createCategory = async (req, res, next) => {
  try {
    const {
      name,
      slug,
      description,
      status,
      icon,
      sortOrder,
    } = req.body;

    const existingCategory =
      await SchemeCategory.findOne({
        $or: [
          { name: name.trim() },
          { slug: slug.trim().toLowerCase() },
        ],
      });

    if (existingCategory) {
      return res.status(409).json({
        success: false,
        message:
          "Scheme category with this name or slug already exists",
      });
    }

    const category = await SchemeCategory.create({
      name,
      slug,
      description,
      status,
      icon,
      sortOrder,
    });

    res.status(201).json({
      success: true,
      message: "Scheme category created successfully",
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// UPDATE CATEGORY
// PATCH /api/scheme-categories/:id
// =========================================================

const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    const category =
      await SchemeCategory.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Scheme category not found",
      });
    }

    const previousSlug = category.slug;

    const {
      name,
      slug,
      description,
      status,
      icon,
      sortOrder,
    } = req.body;

    if (name !== undefined) {
      category.name = name;
    }

    if (slug !== undefined) {
      category.slug = slug;
    }

    if (description !== undefined) {
      category.description = description;
    }

    if (status !== undefined) {
      category.status = status;
    }
    if (icon !== undefined) {
      category.icon = icon;
    }
    if (sortOrder !== undefined) {
      category.sortOrder = Number(sortOrder) || 0;
    }

    const duplicateFilter = {
      _id: { $ne: id },
    };

    if (category.name) {
      duplicateFilter.name = category.name;
    }

    const duplicateName =
      await SchemeCategory.findOne(
        duplicateFilter
      );

    if (duplicateName) {
      return res.status(409).json({
        success: false,
        message:
          "Another category with this name already exists",
      });
    }

    const duplicateSlug =
      await SchemeCategory.findOne({
        _id: { $ne: id },
        slug: category.slug,
      });

    if (duplicateSlug) {
      return res.status(409).json({
        success: false,
        message:
          "Another category with this slug already exists",
      });
    }

    await category.save();
    if (previousSlug !== category.slug) {
      await GovernmentScheme.updateMany(
        { $or: [{ categoryId: category._id }, { categorySlug: previousSlug }] },
        { $set: { category: category.name, categorySlug: category.slug } }
      );
    } else {
      await GovernmentScheme.updateMany(
        { categoryId: category._id },
        { $set: { category: category.name } }
      );
    }

    res.status(200).json({
      success: true,
      message: "Scheme category updated successfully",
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// DELETE CATEGORY
// DELETE /api/scheme-categories/:id
// =========================================================

const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    const category =
      await SchemeCategory.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Scheme category not found",
      });
    }

    if (await GovernmentScheme.exists({
      $or: [{ categoryId: category._id }, { categorySlug: category.slug }],
    })) {
      return res.status(409).json({
        success: false,
        message: "इस श्रेणी में योजनाएँ मौजूद हैं। पहले उनकी category बदलें।",
      });
    }

    await SchemeCategory.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Scheme category deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};