const mongoose = require("mongoose");
const LivestockCategory = require("../models/LivestockCategory");
const LivestockArticle = require("../models/LivestockArticle");

const getCategories = async (req, res, next) => {
  try {
    const filter = {};
    if (["active", "inactive"].includes(req.query.status)) {
      filter.status = req.query.status;
    }
    const categories = await LivestockCategory.find(filter)
      .sort({ sortOrder: 1, name: 1 })
      .lean();
    return res.json({ success: true, data: categories });
  } catch (error) {
    return next(error);
  }
};

const getCategoryById = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid category ID" });
    }
    const category = await LivestockCategory.findById(req.params.id).lean();
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }
    return res.json({ success: true, data: category });
  } catch (error) {
    return next(error);
  }
};

const createCategory = async (req, res, next) => {
  try {
    const { name, slug, icon, description, status, sortOrder } = req.body;
    const category = await LivestockCategory.create({
      name,
      slug,
      icon: icon || "🐄",
      description: description || "",
      status: status || "active",
      sortOrder: Number(sortOrder) || 0,
    });
    return res.status(201).json({ success: true, data: category });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: "Category slug already exists" });
    }
    return next(error);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid category ID" });
    }
    const fields = ["name", "slug", "icon", "description", "status", "sortOrder"];
    const updates = Object.fromEntries(
      fields.filter((field) => req.body[field] !== undefined).map((field) => [field, req.body[field]])
    );
    const previousCategory = await LivestockCategory.findById(req.params.id);
    if (!previousCategory) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }
    const category = await LivestockCategory.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }
    if (previousCategory.slug !== category.slug || previousCategory.name !== category.name) {
      await LivestockArticle.updateMany(
        { category: previousCategory.slug },
        { $set: { category: category.slug, categoryLabel: category.name } }
      );
    }
    return res.json({ success: true, data: category });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: "Category slug already exists" });
    }
    return next(error);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid category ID" });
    }
    const category = await LivestockCategory.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }
    const articleCount = await LivestockArticle.countDocuments({ category: category.slug });
    if (articleCount) {
      return res.status(409).json({
        success: false,
        message: "इस category में लेख मौजूद हैं। पहले लेखों की category बदलें।",
      });
    }
    await category.deleteOne();
    return res.json({ success: true, message: "Category deleted" });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};