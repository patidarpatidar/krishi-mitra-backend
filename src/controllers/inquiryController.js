
const mongoose = require("mongoose");
const Inquiry = require("../models/Inquiry");

const allowedStatuses = [
  "new",
  "in-progress",
  "resolved",
  "closed",
];

const allowedTypes = [
  "Mandi Bhav",
  "Crop Advisory",
  "Weather",
  "Government Scheme",
  "Blog Feedback",
  "Other",
];

const allowedDistricts = [
  "Neemuch",
  "Mandsaur",
  "Ratlam",
  "Ujjain",
];

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

exports.createInquiry = async (req, res) => {
  try {
    const {
      name,
      phone,
      email,
      district,
      queryType,
      subject,
      message,
    } = req.body;

    if (
      !name?.trim() ||
      !phone?.trim() ||
      !district ||
      !queryType ||
      !message?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Name, phone, district, query type and message are required.",
      });
    }

    if (!allowedDistricts.includes(district)) {
      return res.status(400).json({
        success: false,
        message: "Invalid district.",
      });
    }

    if (!allowedTypes.includes(queryType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid inquiry type.",
      });
    }

    const digits = phone.replace(/\D/g, "");

    if (digits.length < 10 || digits.length > 15) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid phone number.",
      });
    }

    const inquiry = await Inquiry.create({
      name: name.trim(),
      phone: phone.trim(),
      email: email?.trim() || "",
      district,
      queryType,
      subject: subject?.trim() || "",
      message: message.trim(),
    });

    return res.status(201).json({
      success: true,
      message: "Your inquiry has been submitted successfully.",
      data: {
        inquiryNumber: inquiry.inquiryNumber,
        createdAt: inquiry.createdAt,
      },
    });
  } catch (error) {
    console.error("Create inquiry error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to submit inquiry.",
    });
  }
};

exports.getInquiries = async (req, res) => {
  try {
    const {
      search = "",
      status,
      queryType,
      district,
      page = 1,
      limit = 20,
      sort = "newest",
    } = req.query;

    const pageNumber = Math.max(1, Number(page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(limit) || 20));

    const filter = {};

    if (status && status !== "all") {
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status filter.",
        });
      }

      filter.status = status;
    }

    if (queryType && queryType !== "all") {
      if (!allowedTypes.includes(queryType)) {
        return res.status(400).json({
          success: false,
          message: "Invalid inquiry type filter.",
        });
      }

      filter.queryType = queryType;
    }

    if (district && district !== "all") {
      if (!allowedDistricts.includes(district)) {
        return res.status(400).json({
          success: false,
          message: "Invalid district filter.",
        });
      }

      filter.district = district;
    }

    if (search.trim()) {
      const safeSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(safeSearch, "i");

      filter.$or = [
        { inquiryNumber: regex },
        { name: regex },
        { phone: regex },
        { email: regex },
        { subject: regex },
        { message: regex },
      ];
    }

    const sortOption =
      sort === "oldest"
        ? { createdAt: 1 }
        : { createdAt: -1 };

    const [items, total, statusCounts] = await Promise.all([
      Inquiry.find(filter)
        .sort(sortOption)
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)
        .lean(),

      Inquiry.countDocuments(filter),

      Inquiry.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const counts = {
      all: 0,
      new: 0,
      "in-progress": 0,
      resolved: 0,
      closed: 0,
    };

    statusCounts.forEach((item) => {
      counts[item._id] = item.count;
      counts.all += item.count;
    });

    return res.json({
      success: true,
      data: items,
      pagination: {
        page: pageNumber,
        limit: pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
      counts,
    });
  } catch (error) {
    console.error("Get inquiries error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch inquiries.",
    });
  }
};

exports.getInquiryById = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid inquiry ID.",
      });
    }

    const inquiry = await Inquiry.findById(req.params.id);

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: "Inquiry not found.",
      });
    }

    return res.json({ success: true, data: inquiry });
  } catch (error) {
    console.error("Get inquiry error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch inquiry.",
    });
  }
};

exports.updateInquiry = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid inquiry ID.",
      });
    }

    const allowedFields = [
      "status",
      "priority",
      "adminNotes",
      "assignedTo",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        updates[field] = req.body[field];
      }
    }

    if (!Object.keys(updates).length) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided.",
      });
    }

    if (
      updates.status &&
      !allowedStatuses.includes(updates.status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid inquiry status.",
      });
    }

    if (
      updates.priority &&
      !["low", "normal", "high"].includes(updates.priority)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid priority.",
      });
    }

    if (updates.status === "resolved") {
      updates.resolvedAt = new Date();
    } else if (
      updates.status &&
      updates.status !== "resolved"
    ) {
      updates.resolvedAt = null;
    }

    const inquiry = await Inquiry.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: "Inquiry not found.",
      });
    }

    return res.json({
      success: true,
      message: "Inquiry updated successfully.",
      data: inquiry,
    });
  } catch (error) {
    console.error("Update inquiry error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update inquiry.",
    });
  }
};

exports.deleteInquiry = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid inquiry ID.",
      });
    }

    const inquiry = await Inquiry.findByIdAndDelete(req.params.id);

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: "Inquiry not found.",
      });
    }

    return res.json({
      success: true,
      message: "Inquiry deleted successfully.",
    });
  } catch (error) {
    console.error("Delete inquiry error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete inquiry.",
    });
  }
};