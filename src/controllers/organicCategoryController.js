const OrganicCategory = require("../models/OrganicCategory");

const getCategories = async (req, res) => {
  try {
    const filter = {};

    if (req.query.status) {
      filter.status = req.query.status;
    }

    const categories = await OrganicCategory.find(filter)
      .sort({ name: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    console.error("getCategories:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch organic categories",
    });
  }
};

const getCategoryById = async (req, res) => {
  try {
    const category = await OrganicCategory.findById(req.params.id).lean();

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Organic category not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error("getCategoryById:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch category",
    });
  }
};

const createCategory = async (req, res) => {
  try {
    const category = await OrganicCategory.create({
      name: req.body.name,
      slug: req.body.slug,
      description: req.body.description || "",
      status: req.body.status || "active",
    });

    return res.status(201).json({
      success: true,
      message: "Organic category created successfully",
      data: category,
    });
  } catch (error) {
    console.error("createCategory:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Category slug already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create organic category",
    });
  }
};

const updateCategory = async (req, res) => {
  try {
    const category = await OrganicCategory.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Organic category not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Organic category updated successfully",
      data: category,
    });
  } catch (error) {
    console.error("updateCategory:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Category slug already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update organic category",
    });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const category = await OrganicCategory.findByIdAndDelete(
      req.params.id
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Organic category not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Organic category deleted successfully",
    });
  } catch (error) {
    console.error("deleteCategory:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete organic category",
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