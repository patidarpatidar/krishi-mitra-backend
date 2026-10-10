const mongoose = require("mongoose");
const GovernmentScheme = require("../models/GovernmentScheme");
const SchemeCategory = require("../models/SchemeCategory");

// =========================================================
// HELPER
// =========================================================

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// =========================================================
// GET ALL SCHEMES
// GET /api/schemes
//
// Examples:
// /api/schemes
// /api/schemes?page=1&limit=10
// /api/schemes?search=PM-KISAN
// /api/schemes?category=किसान सहायता
// /api/schemes?categorySlug=kisan-sahayata
// /api/schemes?level=केंद्र सरकार
// /api/schemes?status=active
// /api/schemes?featured=true
// =========================================================

const getSchemes = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      category,
      categorySlug,
      level,
      status,
      featured,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // -----------------------------------------------------
    // Pagination
    // -----------------------------------------------------

    const currentPage = Math.max(
      parseInt(page, 10) || 1,
      1
    );

    const perPage = Math.min(
      Math.max(parseInt(limit, 10) || 10, 1),
      100
    );

    const skip =
      (currentPage - 1) * perPage;

    // -----------------------------------------------------
    // Filter
    // -----------------------------------------------------

    const filter = {};

    if (search && search.trim()) {
      const searchTerm = search.trim();

      filter.$or = [
        {
          name: {
            $regex: searchTerm,
            $options: "i",
          },
        },
        {
          shortName: {
            $regex: searchTerm,
            $options: "i",
          },
        },
        {
          description: {
            $regex: searchTerm,
            $options: "i",
          },
        },
        {
          category: {
            $regex: searchTerm,
            $options: "i",
          },
        },
        {
          government: {
            $regex: searchTerm,
            $options: "i",
          },
        },
        {
          department: {
            $regex: searchTerm,
            $options: "i",
          },
        },
        {
          tags: {
            $regex: searchTerm,
            $options: "i",
          },
        },
      ];
    }

    if (category) {
      filter.category = category;
    }

    if (categorySlug) {
      filter.categorySlug =
        categorySlug.toLowerCase();
    }

    if (level) {
      filter.level = level;
    }

    if (status) {
      filter.status = status;
    }

    if (featured !== undefined) {
      if (
        featured === "true" ||
        featured === true
      ) {
        filter.featured = true;
      }

      if (
        featured === "false" ||
        featured === false
      ) {
        filter.featured = false;
      }
    }

    // -----------------------------------------------------
    // Safe sorting
    // -----------------------------------------------------

    const allowedSortFields = [
      "createdAt",
      "updatedAt",
      "publishedAt",
      "updatedAtContent",
      "name",
      "views",
      "likes",
    ];

    const safeSortBy =
      allowedSortFields.includes(sortBy)
        ? sortBy
        : "createdAt";

    const safeSortOrder =
      sortOrder === "asc" ? 1 : -1;

    const sort = {
      [safeSortBy]: safeSortOrder,
    };

    // -----------------------------------------------------
    // Query + Count in parallel
    // -----------------------------------------------------

    const [schemes, total] =
      await Promise.all([
        GovernmentScheme.find(filter)
          .populate(
            "categoryId",
            "name slug status"
          )
          .sort(sort)
          .skip(skip)
          .limit(perPage)
          .lean(),

        GovernmentScheme.countDocuments(filter),
      ]);

    const totalPages =
      Math.ceil(total / perPage);

    res.status(200).json({
      success: true,

      data: schemes,

      pagination: {
        page: currentPage,
        limit: perPage,
        total,
        totalPages,
        hasNextPage:
          currentPage < totalPages,
        hasPrevPage:
          currentPage > 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// GET SCHEME BY MONGODB ID
// GET /api/schemes/:id
// =========================================================

const getSchemeById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid scheme ID",
      });
    }

    const scheme =
      await GovernmentScheme.findById(id)
        .populate(
          "categoryId",
          "name slug status description"
        )
        .lean();

    if (!scheme) {
      return res.status(404).json({
        success: false,
        message: "Government scheme not found",
      });
    }

    res.status(200).json({
      success: true,
      data: scheme,
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// GET SCHEME BY SLUG
// GET /api/schemes/slug/:slug
// =========================================================

const getSchemeBySlug = async (
  req,
  res,
  next
) => {
  try {
    const { slug } = req.params;

    const scheme =
      await GovernmentScheme.findOne({
        slug: slug.toLowerCase(),
        status: "active",
      })
        .populate(
          "categoryId",
          "name slug status description"
        )
        .lean();

    if (!scheme) {
      return res.status(404).json({
        success: false,
        message: "Government scheme not found",
      });
    }

    res.status(200).json({
      success: true,
      data: scheme,
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// CREATE SCHEME
// POST /api/schemes
// =========================================================

const createScheme = async (
  req,
  res,
  next
) => {
  try {
    const data = {
      ...req.body,
    };

    // -----------------------------------------------------
    // Normalize ID + slug
    // -----------------------------------------------------

    if (data.id) {
      data.id = data.id
        .trim()
        .toLowerCase();
    }

    if (data.slug) {
      data.slug = data.slug
        .trim()
        .toLowerCase();
    }

    // -----------------------------------------------------
    // Check duplicate ID
    // -----------------------------------------------------

    const existingById =
      await GovernmentScheme.findOne({
        id: data.id,
      });

    if (existingById) {
      return res.status(409).json({
        success: false,
        message:
          "Scheme with this ID already exists",
      });
    }

    // -----------------------------------------------------
    // Check duplicate slug
    // -----------------------------------------------------

    const existingBySlug =
      await GovernmentScheme.findOne({
        slug: data.slug,
      });

    if (existingBySlug) {
      return res.status(409).json({
        success: false,
        message:
          "Scheme with this slug already exists",
      });
    }

    // -----------------------------------------------------
    // Category handling
    // -----------------------------------------------------

    if (data.categoryId) {
      if (
        !isValidObjectId(data.categoryId)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid category ID",
        });
      }

      const category =
        await SchemeCategory.findById(
          data.categoryId
        );

      if (!category) {
        return res.status(404).json({
          success: false,
          message:
            "Scheme category not found",
        });
      }

      data.category = category.name;
      data.categorySlug = category.slug;
    }

    // -----------------------------------------------------
    // If category string exists but categoryId doesn't
    // -----------------------------------------------------

    if (
      data.category &&
      !data.categoryId
    ) {
      const category =
        await SchemeCategory.findOne({
          name: data.category,
        });

      if (category) {
        data.categoryId = category._id;
        data.categorySlug =
          category.slug;
      }
    }

    // -----------------------------------------------------
    // Create
    // -----------------------------------------------------

    const scheme =
      await GovernmentScheme.create(data);

    // -----------------------------------------------------
    // Populate response
    // -----------------------------------------------------

    const populatedScheme =
      await GovernmentScheme.findById(
        scheme._id
      )
        .populate(
          "categoryId",
          "name slug status"
        )
        .lean();

    res.status(201).json({
      success: true,
      message:
        "Government scheme created successfully",
      data: populatedScheme,
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// UPDATE SCHEME
// PATCH /api/schemes/:id
// =========================================================

const updateScheme = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid scheme ID",
      });
    }

    const scheme =
      await GovernmentScheme.findById(id);

    if (!scheme) {
      return res.status(404).json({
        success: false,
        message: "Government scheme not found",
      });
    }

    const data = {
      ...req.body,
    };

    // -----------------------------------------------------
    // Normalize ID + slug
    // -----------------------------------------------------

    if (data.id !== undefined) {
      data.id = data.id
        .trim()
        .toLowerCase();
    }

    if (data.slug !== undefined) {
      data.slug = data.slug
        .trim()
        .toLowerCase();
    }

    // -----------------------------------------------------
    // Duplicate ID check
    // -----------------------------------------------------

    if (
      data.id &&
      data.id !== scheme.id
    ) {
      const duplicateId =
        await GovernmentScheme.findOne({
          id: data.id,
          _id: { $ne: id },
        });

      if (duplicateId) {
        return res.status(409).json({
          success: false,
          message:
            "Another scheme with this ID already exists",
        });
      }
    }

    // -----------------------------------------------------
    // Duplicate slug check
    // -----------------------------------------------------

    if (
      data.slug &&
      data.slug !== scheme.slug
    ) {
      const duplicateSlug =
        await GovernmentScheme.findOne({
          slug: data.slug,
          _id: { $ne: id },
        });

      if (duplicateSlug) {
        return res.status(409).json({
          success: false,
          message:
            "Another scheme with this slug already exists",
        });
      }
    }

    // -----------------------------------------------------
    // Category handling
    // -----------------------------------------------------

    if (
      data.categoryId !== undefined
    ) {
      if (
        data.categoryId &&
        !isValidObjectId(
          data.categoryId
        )
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid category ID",
        });
      }

      if (data.categoryId) {
        const category =
          await SchemeCategory.findById(
            data.categoryId
          );

        if (!category) {
          return res.status(404).json({
            success: false,
            message:
              "Scheme category not found",
          });
        }

        data.category = category.name;
        data.categorySlug =
          category.slug;
      } else {
        data.categoryId = null;
      }
    }

    // -----------------------------------------------------
    // Update
    // -----------------------------------------------------

    Object.assign(scheme, data);

    await scheme.save();

    // -----------------------------------------------------
    // Populate response
    // -----------------------------------------------------

    const updatedScheme =
      await GovernmentScheme.findById(
        scheme._id
      )
        .populate(
          "categoryId",
          "name slug status"
        )
        .lean();

    res.status(200).json({
      success: true,
      message:
        "Government scheme updated successfully",
      data: updatedScheme,
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// DELETE SCHEME
// DELETE /api/schemes/:id
// =========================================================

const deleteScheme = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid scheme ID",
      });
    }

    const scheme =
      await GovernmentScheme.findById(id);

    if (!scheme) {
      return res.status(404).json({
        success: false,
        message: "Government scheme not found",
      });
    }

    await GovernmentScheme.findByIdAndDelete(
      id
    );

    res.status(200).json({
      success: true,
      message:
        "Government scheme deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// UPDATE STATUS
// PATCH /api/schemes/:id/status
// Body:
// {
//   "status": "active"
// }
// =========================================================

const updateSchemeStatus = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid scheme ID",
      });
    }

    const allowedStatuses = [
      "active",
      "inactive",
      "draft",
      "archived",
    ];

    if (
      !allowedStatuses.includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid status",
      });
    }

    const scheme =
      await GovernmentScheme.findByIdAndUpdate(
        id,
        {
          status,
        },
        {
          new: true,
          runValidators: true,
        }
      )
        .populate(
          "categoryId",
          "name slug status"
        );

    if (!scheme) {
      return res.status(404).json({
        success: false,
        message: "Government scheme not found",
      });
    }

    res.status(200).json({
      success: true,
      message:
        "Scheme status updated successfully",
      data: scheme,
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// UPDATE FEATURED
// PATCH /api/schemes/:id/featured
// Body:
// {
//   "featured": true
// }
// =========================================================

const updateSchemeFeatured = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;
    const { featured } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid scheme ID",
      });
    }

    if (typeof featured !== "boolean") {
      return res.status(400).json({
        success: false,
        message:
          "Featured must be boolean",
      });
    }

    const scheme =
      await GovernmentScheme.findByIdAndUpdate(
        id,
        {
          featured,
        },
        {
          new: true,
          runValidators: true,
        }
      )
        .populate(
          "categoryId",
          "name slug status"
        );

    if (!scheme) {
      return res.status(404).json({
        success: false,
        message: "Government scheme not found",
      });
    }

    res.status(200).json({
      success: true,
      message:
        "Scheme featured status updated successfully",
      data: scheme,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSchemes,
  getSchemeById,
  getSchemeBySlug,
  createScheme,
  updateScheme,
  deleteScheme,
  updateSchemeStatus,
  updateSchemeFeatured,
};