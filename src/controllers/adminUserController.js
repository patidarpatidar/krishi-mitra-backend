const User = require("../models/User");
const mongoose = require("mongoose");

exports.getFarmerById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid farmer ID." });
    }
    const farmer = await User.findOne({ _id: req.params.id, role: "farmer" })
      .select("-password")
      .lean();
    if (!farmer) {
      return res.status(404).json({ success: false, message: "किसान अकाउंट नहीं मिला।" });
    }
    return res.json({ success: true, data: farmer });
  } catch (error) {
    console.error("Get admin farmer details error:", error);
    return res.status(500).json({ success: false, message: "किसान विवरण लोड नहीं हो सके।" });
  }
};

exports.getFarmers = async (req, res) => {
  try {
    const { search, status } = req.query;

    const filter = { role: "farmer" };

    if (status === "active") {
      filter.isActive = true;
    } else if (status === "blocked" || status === "inactive") {
      filter.isActive = false;
    }

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), "i");
      filter.$or = [
        { name: regex },
        { phone: regex },
        { email: regex },
        { village: regex },
        { district: regex },
      ];
    }

    const farmers = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    const formatted = farmers.map((f) => ({
      id: f._id,
      _id: f._id,
      name: f.name,
      phone: f.phone,
      email: f.email,
      village: f.village,
      district: f.district,
      state: f.state,
      landArea: f.landArea || 0,
      landUnit: f.landUnit || "Acre",
      irrigation: f.irrigation || "",
      cropsCount: f.crops?.length || 0,
      isActive: f.isActive,
      status: f.isActive ? "active" : "blocked",
      createdAt: f.createdAt,
    }));

    return res.json({
      success: true,
      data: formatted,
      total: formatted.length,
    });
  } catch (error) {
    console.error("Get admin farmers error:", error);
    return res.status(500).json({
      success: false,
      message: "किसान डेटा लोड करने में समस्या हुई।",
    });
  }
};

exports.toggleFarmerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user || user.role !== "farmer") {
      return res.status(404).json({
        success: false,
        message: "किसान अकाउंट नहीं मिला।",
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    return res.json({
      success: true,
      message: `किसान अकाउंट ${user.isActive ? "सक्रिय" : "ब्लॉक"} कर दिया गया।`,
      data: {
        id: user._id,
        isActive: user.isActive,
        status: user.isActive ? "active" : "blocked",
      },
    });
  } catch (error) {
    console.error("Toggle farmer status error:", error);
    return res.status(500).json({
      success: false,
      message: "Status बदलने में समस्या हुई।",
    });
  }
};

exports.deleteFarmer = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user || user.role !== "farmer") {
      return res.status(404).json({
        success: false,
        message: "किसान अकाउंट नहीं मिला।",
      });
    }

    await User.findByIdAndDelete(id);

    return res.json({
      success: true,
      message: "किसान अकाउंट डिलीट कर दिया गया।",
    });
  } catch (error) {
    console.error("Delete farmer error:", error);
    return res.status(500).json({
      success: false,
      message: "अकाउंट डिलीट करने में समस्या हुई।",
    });
  }
};
