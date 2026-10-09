
const mongoose = require("mongoose");
const BlogCategory = require("../models/BlogCategory");
const Blog = require("../models/Blog");

const getCategories = async (req, res) => {
  try {
    const filter = {};

    if (req.user?.role === "admin") {
      if (req.query.status) {
        filter.status = req.query.status;
      }
    } else {
      filter.status = "active";
    }

    const categories = await BlogCategory.find(filter)
      .sort({ sortOrder: 1, label: 1 })
      .lean();

    return res.json({ success: true, data: categories });
  } catch (error) {
    console.error("Get categories error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch blog categories",
    });
  }
};

const getCategoryById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    const filter = { _id: req.params.id };

    if (req.user?.role !== "admin") {
      filter.status = "active";
    }

    const category = await BlogCategory.findOne(filter).lean();

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    return res.json({ success: true, data: category });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch category",
    });
  }
};

const createCategory = async (req, res) => {
  try {
    const { label, slug, icon, description, status, sortOrder } = req.body;

    if (
      typeof label !== "string" ||
      !label.trim() ||
      typeof slug !== "string" ||
      !slug.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Category label and slug are required",
      });
    }

    const category = await BlogCategory.create({
      label: label.trim(),
      slug: slug.trim().toLowerCase(),
      icon,
      description,
      status,
      sortOrder,
    });

    return res.status(201).json({
      success: true,
      message: "Blog category created",
      data: category,
    });
  } catch (error) {
    return res.status(error.code === 11000 ? 409 : 400).json({
      success: false,
      message:
        error.code === 11000
          ? "Category slug already exists"
          : error.message,
    });
  }
};

const updateCategory = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    const allowedFields = [
      "label",
      "slug",
      "icon",
      "description",
      "status",
      "sortOrder",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (typeof updates.label === "string") {
      updates.label = updates.label.trim();

      if (!updates.label) {
        return res.status(400).json({
          success: false,
          message: "Category label cannot be empty",
        });
      }
    }

    if (typeof updates.slug === "string") {
      updates.slug = updates.slug.trim().toLowerCase();

      if (!updates.slug) {
        return res.status(400).json({
          success: false,
          message: "Category slug cannot be empty",
        });
      }
    }

    const category = await BlogCategory.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    return res.json({
      success: true,
      message: "Blog category updated",
      data: category,
    });
  } catch (error) {
    return res.status(error.code === 11000 ? 409 : 400).json({
      success: false,
      message:
        error.code === 11000
          ? "Category slug already exists"
          : error.message,
    });
  }
};

const deleteCategory = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    const category = await BlogCategory.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const linkedBlogs = await Blog.countDocuments({
      categoryId: category._id,
    });

    if (linkedBlogs > 0) {
      return res.status(409).json({
        success: false,
        message: `This category has ${linkedBlogs} linked blogs. Reassign them before deleting.`,
      });
    }

    await category.deleteOne();

    return res.json({
      success: true,
      message: "Blog category deleted",
    });
  } catch (error) {
    console.error("Delete category error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete category",
    });
  }
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};