const mongoose = require("mongoose");
const Subscriber = require("../models/Subscriber");

function normalizeContact(value) {
  if (typeof value !== "string" || !value.trim()) {
    return { error: "Email or mobile number is required." };
  }

  const contact = value.trim();
  if (contact.includes("@")) {
    const email = contact.toLowerCase();
    if (
      email.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      return { error: "Please enter a valid email address." };
    }
    return { email };
  }

  if (/[^+\d\s().-]/.test(contact)) {
    return { error: "Please enter a valid 10-digit Indian mobile number." };
  }

  const digits = contact.replace(/\D/g, "");
  const mobile =
    digits.length === 12 && digits.startsWith("91")
      ? digits.slice(2)
      : digits;

  if (!/^[6-9]\d{9}$/.test(mobile)) {
    return { error: "Please enter a valid 10-digit Indian mobile number." };
  }

  return { mobile };
}

exports.createSubscriber = async (req, res) => {
  const contact = normalizeContact(req.body?.contact);
  if (contact.error) {
    return res.status(400).json({
      success: false,
      message: contact.error,
    });
  }

  try {
    const subscriber = await Subscriber.create({
      ...contact,
      source: "footer",
    });

    return res.status(201).json({
      success: true,
      message: "Subscription saved successfully.",
      data: {
        id: subscriber._id,
        status: subscriber.status,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "This email or mobile number is already subscribed.",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email or mobile number.",
      });
    }

    console.error("Create subscriber error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to save subscription.",
    });
  }
};

exports.getSubscribers = async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const filter = {};

    if (req.query.status && req.query.status !== "all") {
      if (!["subscribed", "unsubscribed"].includes(req.query.status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid subscriber status.",
        });
      }
      filter.status = req.query.status;
    }

    if (typeof req.query.search === "string" && req.query.search.trim()) {
      const escaped = req.query.search
        .trim()
        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { email: new RegExp(escaped, "i") },
        { mobile: new RegExp(escaped, "i") },
      ];
    }

    const [data, total] = await Promise.all([
      Subscriber.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Subscriber.countDocuments(filter),
    ]);

    return res.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get subscribers error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch subscribers.",
    });
  }
};

exports.updateSubscriber = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid subscriber ID.",
    });
  }

  const { status } = req.body || {};
  if (!["subscribed", "unsubscribed"].includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Status must be subscribed or unsubscribed.",
    });
  }

  try {
    const subscriber = await Subscriber.findByIdAndUpdate(
      req.params.id,
      { $set: { status } },
      { new: true, runValidators: true },
    );

    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message: "Subscriber not found.",
      });
    }

    return res.json({
      success: true,
      message: "Subscriber updated successfully.",
      data: subscriber,
    });
  } catch (error) {
    console.error("Update subscriber error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to update subscriber.",
    });
  }
};

exports.deleteSubscriber = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid subscriber ID.",
    });
  }

  try {
    const subscriber = await Subscriber.findByIdAndDelete(req.params.id);
    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message: "Subscriber not found.",
      });
    }

    return res.json({
      success: true,
      message: "Subscriber deleted successfully.",
    });
  } catch (error) {
    console.error("Delete subscriber error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to delete subscriber.",
    });
  }
};
