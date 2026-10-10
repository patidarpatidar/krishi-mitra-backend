const OrganicRecipe = require("../models/OrganicRecipe");

const getRecipes = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      category,
      status,
      featured,
    } = req.query;

    const pageNumber = Math.max(Number(page), 1);
    const limitNumber = Math.min(Math.max(Number(limit), 1), 100);

    const filter = {};

    if (req.user?.role !== "admin") {
      filter.status = "active";
    }

    if (category && category !== "all") {
      filter.category = category;
    }

    if (status && status !== "all") {
      filter.status = status;
    }

    if (featured !== undefined) {
      filter.featured = featured === "true";
    }

    if (search?.trim()) {
      const regex = new RegExp(search.trim(), "i");

      filter.$or = [
        { title: regex },
        { titleEn: regex },
        { type: regex },
        { target: regex },
        { category: regex },
        { id: regex },
      ];
    }

    const skip = (pageNumber - 1) * limitNumber;

    const [recipes, total] = await Promise.all([
      OrganicRecipe.find(filter)
        .sort({
          featured: -1,
          createdAt: -1,
        })
        .skip(skip)
        .limit(limitNumber)
        .lean(),

      OrganicRecipe.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: recipes,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        totalPages: Math.ceil(total / limitNumber),
      },
    });
  } catch (error) {
    console.error("getRecipes:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch organic recipes",
    });
  }
};

const getRecipeById = async (req, res) => {
  try {
    const recipe = await OrganicRecipe.findById(req.params.id).lean();

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: "Organic recipe not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: recipe,
    });
  } catch (error) {
    console.error("getRecipeById:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch organic recipe",
    });
  }
};

const getRecipeBySlug = async (req, res) => {
  try {
    const recipe = await OrganicRecipe.findOne({
      slug: req.params.slug,
    }).lean();

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: "Organic recipe not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: recipe,
    });
  } catch (error) {
    console.error("getRecipeBySlug:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch organic recipe",
    });
  }
};

const createRecipe = async (req, res) => {
  try {
    const recipe = await OrganicRecipe.create({
      ...req.body,
      publishedAt:
        req.body.status === "active"
          ? req.body.publishedAt || new Date()
          : null,

      updatedAtContent: new Date(),
    });

    return res.status(201).json({
      success: true,
      message: "Organic recipe created successfully",
      data: recipe,
    });
  } catch (error) {
    console.error("createRecipe:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Recipe id or slug already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create organic recipe",
    });
  }
};

const updateRecipe = async (req, res) => {
  try {
    const updateData = {
      ...req.body,
      updatedAtContent: new Date(),
    };

    if (
      req.body.status === "active" &&
      !req.body.publishedAt
    ) {
      updateData.publishedAt = new Date();
    }

    const recipe = await OrganicRecipe.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: "Organic recipe not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Organic recipe updated successfully",
      data: recipe,
    });
  } catch (error) {
    console.error("updateRecipe:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Recipe id or slug already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update organic recipe",
    });
  }
};

const deleteRecipe = async (req, res) => {
  try {
    const recipe = await OrganicRecipe.findByIdAndDelete(
      req.params.id
    );

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: "Organic recipe not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Organic recipe deleted successfully",
    });
  } catch (error) {
    console.error("deleteRecipe:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete organic recipe",
    });
  }
};

const updateRecipeStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (
      !["active", "inactive", "draft", "archived"].includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid recipe status",
      });
    }

    const updateData = {
      status,
      updatedAtContent: new Date(),
    };

    if (status === "active") {
      updateData.publishedAt = new Date();
    }

    const recipe = await OrganicRecipe.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: "Organic recipe not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Recipe status updated successfully",
      data: recipe,
    });
  } catch (error) {
    console.error("updateRecipeStatus:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update recipe status",
    });
  }
};

const updateRecipeFeatured = async (req, res) => {
  try {
    const { featured } = req.body;

    if (typeof featured !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "featured must be boolean",
      });
    }

    const recipe = await OrganicRecipe.findByIdAndUpdate(
      req.params.id,
      {
        featured,
        updatedAtContent: new Date(),
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: "Organic recipe not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Featured status updated successfully",
      data: recipe,
    });
  } catch (error) {
    console.error("updateRecipeFeatured:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update featured status",
    });
  }
};

module.exports = {
  getRecipes,
  getRecipeById,
  getRecipeBySlug,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  updateRecipeStatus,
  updateRecipeFeatured,
};