const User = require("../models/User");
const Crop = require("../models/Crop");
const GovernmentScheme = require("../models/GovernmentScheme");

function publicUser(user) {
  return {
    id: user._id,
    _id: user._id,
    name: user.name,
    phone: user.phone,
    email: user.email,
    village: user.village,
    district: user.district,
    state: user.state,
    pincode: user.pincode || "",
    landArea: user.landArea || 0,
    landUnit: user.landUnit || "Acre",
    irrigation: user.irrigation || "",
    crops: user.crops || [],
    savedItems: user.savedItems || [],
    watchlist: user.watchlist || [],
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

// ----------------------------------------------------
// PROFILE
// ----------------------------------------------------
exports.getProfile = async (req, res) => {
  try {
    return res.json({
      success: true,
      data: { user: publicUser(req.user) },
    });
  } catch (error) {
    console.error("Get farmer profile error:", error);
    return res.status(500).json({
      success: false,
      message: "Profile लोड करने में समस्या हुई।",
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const user = req.user;
    const {
      name,
      phone,
      email,
      village,
      district,
      state,
      pincode,
      landArea,
      landUnit,
      irrigation,
    } = req.body;

    if (name !== undefined) user.name = name.trim();
    if (village !== undefined) user.village = village.trim();
    if (district !== undefined) user.district = district.trim();
    if (state !== undefined) user.state = state.trim();
    if (pincode !== undefined) user.pincode = pincode.trim();
    if (irrigation !== undefined) user.irrigation = irrigation.trim();

    if (landArea !== undefined && landArea !== "") {
      const parsed = Number(landArea);
      if (Number.isFinite(parsed) && parsed >= 0) {
        user.landArea = parsed;
      }
    }

    if (landUnit && ["Acre", "Bigha", "Hectare"].includes(landUnit)) {
      user.landUnit = landUnit;
    }

    if (phone) {
      const normalizedPhone = String(phone).replace(/\D/g, "");
      if (!/^[6-9]\d{9}$/.test(normalizedPhone)) {
        return res.status(400).json({
          success: false,
          message: "सही 10 digit मोबाइल नंबर दर्ज करें।",
        });
      }

      const duplicatePhone = await User.findOne({
        phone: normalizedPhone,
        _id: { $ne: user._id },
      });

      if (duplicatePhone) {
        return res.status(409).json({
          success: false,
          message: "यह मोबाइल नंबर पहले से किसी अन्य अकाउंट में दर्ज है।",
        });
      }

      user.phone = normalizedPhone;
    }

    if (email) {
      const normalizedEmail = String(email).trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
        return res.status(400).json({
          success: false,
          message: "Valid email दर्ज करें।",
        });
      }

      const duplicateEmail = await User.findOne({
        email: normalizedEmail,
        _id: { $ne: user._id },
      });

      if (duplicateEmail) {
        return res.status(409).json({
          success: false,
          message: "यह ईमेल पहले से किसी अन्य अकाउंट में दर्ज है।",
        });
      }

      user.email = normalizedEmail;
    }

    await user.save();

    return res.json({
      success: true,
      message: "Profile सफलतापूर्वक सुरक्षित हो गई।",
      data: { user: publicUser(user) },
    });
  } catch (error) {
    console.error("Update farmer profile error:", error);
    return res.status(500).json({
      success: false,
      message: "Profile अपडेट करने में समस्या हुई।",
    });
  }
};

// ----------------------------------------------------
// CROPS
// ----------------------------------------------------
exports.getCrops = async (req, res) => {
  try {
    return res.json({
      success: true,
      data: req.user.crops || [],
    });
  } catch (error) {
    console.error("Get farmer crops error:", error);
    return res.status(500).json({
      success: false,
      message: "फसल सूची लोड करने में समस्या हुई।",
    });
  }
};

exports.addCrop = async (req, res) => {
  try {
    const {
      name,
      area,
      season,
      status,
      sowingDate,
      estimatedProductionQuintals,
      expectedSalePrice,
    } = req.body;

    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "फसल का नाम भरना जरूरी है।",
      });
    }

    const parsedArea = Number(area);
    const parsedProduction = Number(estimatedProductionQuintals || 0);
    const parsedSalePrice = Number(expectedSalePrice || 0);
    if (
      !Number.isFinite(parsedArea) ||
      parsedArea <= 0 ||
      !Number.isFinite(parsedProduction) ||
      parsedProduction < 0 ||
      !Number.isFinite(parsedSalePrice) ||
      parsedSalePrice < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "रकबा, अनुमानित उत्पादन और बिक्री दर सही दर्ज करें।",
      });
    }

    const newCrop = {
      name: name.trim(),
      area: parsedArea,
      season: season || "खरीफ",
      status: status || "बुवाई की तैयारी",
      sowingDate: sowingDate || "",
      estimatedProductionQuintals: parsedProduction,
      expectedSalePrice: parsedSalePrice,
      createdAt: new Date(),
    };

    req.user.crops.push(newCrop);
    await req.user.save();

    return res.status(201).json({
      success: true,
      message: "फसल सफलतापूर्वक जोड़ दी गई।",
      data: req.user.crops,
    });
  } catch (error) {
    console.error("Add crop error:", error);
    return res.status(500).json({
      success: false,
      message: "फसल जोड़ने में समस्या हुई।",
    });
  }
};

exports.updateCrop = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      area,
      season,
      status,
      sowingDate,
      estimatedProductionQuintals,
      expectedSalePrice,
      isArchived,
    } = req.body;

    const crop = req.user.crops.id(id);
    if (!crop) {
      return res.status(404).json({
        success: false,
        message: "फसल नहीं मिली।",
      });
    }

    if (name !== undefined) crop.name = name.trim();
    if (area !== undefined) crop.area = Number(area) || 0;
    if (season !== undefined) crop.season = season;
    if (status !== undefined) crop.status = status;
    if (sowingDate !== undefined) crop.sowingDate = sowingDate;
    if (estimatedProductionQuintals !== undefined) {
      const parsed = Number(estimatedProductionQuintals);
      if (!Number.isFinite(parsed) || parsed < 0) {
        return res.status(400).json({ success: false, message: "अनुमानित उत्पादन सही भरें।" });
      }
      crop.estimatedProductionQuintals = parsed;
    }
    if (expectedSalePrice !== undefined) {
      const parsed = Number(expectedSalePrice);
      if (!Number.isFinite(parsed) || parsed < 0) {
        return res.status(400).json({ success: false, message: "बिक्री मूल्य सही भरें।" });
      }
      crop.expectedSalePrice = parsed;
    }
    if (isArchived !== undefined) {
      crop.isArchived = Boolean(isArchived);
      crop.archivedAt = crop.isArchived ? new Date() : null;
    }

    await req.user.save();

    return res.json({
      success: true,
      message: "फसल अपडेट हो गई।",
      data: req.user.crops,
    });
  } catch (error) {
    console.error("Update crop error:", error);
    return res.status(500).json({
      success: false,
      message: "फसल अपडेट करने में समस्या हुई।",
    });
  }
};

exports.deleteCrop = async (req, res) => {
  try {
    const { id } = req.params;
    const crop = req.user.crops.id(id);

    if (!crop) {
      return res.status(404).json({
        success: false,
        message: "फसल नहीं मिली।",
      });
    }

    req.user.crops.pull({ _id: id });
    await req.user.save();

    return res.json({
      success: true,
      message: "फसल सफलतापूर्वक हटा दी गई।",
      data: req.user.crops,
    });
  } catch (error) {
    console.error("Delete crop error:", error);
    return res.status(500).json({
      success: false,
      message: "फसल हटाने में समस्या हुई।",
    });
  }
};

function serializeCropExpenses(crop) {
  const expenses = crop.expenses || [];
  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  return { expenses, total };
}

exports.getCropExpenses = async (req, res) => {
  const crop = req.user.crops.id(req.params.id);
  if (!crop) {
    return res.status(404).json({ success: false, message: "फसल नहीं मिली।" });
  }

  return res.json({ success: true, data: serializeCropExpenses(crop) });
};

exports.addCropExpense = async (req, res) => {
  try {
    const crop = req.user.crops.id(req.params.id);
    if (!crop) {
      return res.status(404).json({ success: false, message: "फसल नहीं मिली।" });
    }

    const { category, stage = "बुवाई", amount, date, note = "" } = req.body;
    const parsedAmount = Number(amount);
    const parsedDate = date ? new Date(date) : new Date();

    if (
      typeof category !== "string" ||
      !category.trim() ||
      typeof stage !== "string" ||
      !stage.trim() ||
      !Number.isFinite(parsedAmount) ||
      parsedAmount <= 0 ||
      Number.isNaN(parsedDate.getTime()) ||
      typeof note !== "string"
    ) {
      return res.status(400).json({ success: false, message: "खर्च का विवरण सही भरें।" });
    }

    crop.expenses.push({
      category: category.trim(),
      stage: stage.trim(),
      amount: parsedAmount,
      date: parsedDate,
      note: note.trim(),
      createdAt: new Date(),
    });
    await req.user.save();

    return res.status(201).json({
      success: true,
      message: "फसल का खर्च सुरक्षित हो गया।",
      data: serializeCropExpenses(crop),
    });
  } catch (error) {
    console.error("Add crop expense error:", error);
    return res.status(500).json({ success: false, message: "खर्च सुरक्षित नहीं हो सका।" });
  }
};

exports.updateCropExpense = async (req, res) => {
  try {
    const crop = req.user.crops.id(req.params.id);
    const expense = crop?.expenses.id(req.params.expenseId);
    if (!crop || !expense) {
      return res.status(404).json({ success: false, message: "खर्च नहीं मिला।" });
    }

    const { category, stage, amount, date, note } = req.body;
    if (category !== undefined) {
      if (typeof category !== "string" || !category.trim()) {
        return res.status(400).json({ success: false, message: "खर्च का प्रकार भरें।" });
      }
      expense.category = category.trim();
    }
    if (stage !== undefined) {
      if (typeof stage !== "string" || !stage.trim()) {
        return res.status(400).json({ success: false, message: "फसल का चरण चुनें।" });
      }
      expense.stage = stage.trim();
    }
    if (amount !== undefined) {
      const parsedAmount = Number(amount);
      if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
        return res.status(400).json({ success: false, message: "खर्च राशि सही भरें।" });
      }
      expense.amount = parsedAmount;
    }
    if (date !== undefined) {
      const parsedDate = new Date(date);
      if (Number.isNaN(parsedDate.getTime())) {
        return res.status(400).json({ success: false, message: "खर्च की तारीख सही भरें।" });
      }
      expense.date = parsedDate;
    }
    if (note !== undefined) {
      if (typeof note !== "string") {
        return res.status(400).json({ success: false, message: "नोट सही भरें।" });
      }
      expense.note = note.trim();
    }

    await req.user.save();
    return res.json({
      success: true,
      message: "खर्च अपडेट हो गया।",
      data: serializeCropExpenses(crop),
    });
  } catch (error) {
    console.error("Update crop expense error:", error);
    return res.status(500).json({ success: false, message: "खर्च अपडेट नहीं हो सका।" });
  }
};

exports.deleteCropExpense = async (req, res) => {
  try {
    const crop = req.user.crops.id(req.params.id);
    if (!crop || !crop.expenses.id(req.params.expenseId)) {
      return res.status(404).json({ success: false, message: "खर्च नहीं मिला।" });
    }

    crop.expenses.pull({ _id: req.params.expenseId });
    await req.user.save();
    return res.json({
      success: true,
      message: "खर्च हटा दिया गया।",
      data: serializeCropExpenses(crop),
    });
  } catch (error) {
    console.error("Delete crop expense error:", error);
    return res.status(500).json({ success: false, message: "खर्च हटाया नहीं जा सका।" });
  }
};

// ----------------------------------------------------
// SAVED ITEMS
// ----------------------------------------------------
exports.getSavedItems = async (req, res) => {
  try {
    return res.json({
      success: true,
      data: req.user.savedItems || [],
    });
  } catch (error) {
    console.error("Get saved items error:", error);
    return res.status(500).json({
      success: false,
      message: "सेव की गई जानकारी लोड करने में समस्या हुई।",
    });
  }
};

exports.addSavedItem = async (req, res) => {
  try {
    const { itemId, type, title, category, url } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "शीर्षक (title) भरना जरूरी है।",
      });
    }

    // Check duplicate
    const exists = req.user.savedItems.some(
      (item) =>
        (itemId && item.itemId === itemId) ||
        item.title.toLowerCase() === title.trim().toLowerCase()
    );

    if (exists) {
      return res.status(409).json({
        success: false,
        message: "यह जानकारी पहले से सेव की गई है।",
        data: req.user.savedItems,
      });
    }

    req.user.savedItems.push({
      itemId: itemId || `item-${Date.now()}`,
      type: type || "scheme",
      title: title.trim(),
      category: category?.trim() || "",
      url: url?.trim() || "",
      createdAt: new Date(),
    });

    await req.user.save();

    return res.status(201).json({
      success: true,
      message: "जानकारी सफलतापूर्वक सेव कर ली गई।",
      data: req.user.savedItems,
    });
  } catch (error) {
    console.error("Add saved item error:", error);
    return res.status(500).json({
      success: false,
      message: "जानकारी सेव करने में समस्या हुई।",
    });
  }
};

exports.deleteSavedItem = async (req, res) => {
  try {
    const { id } = req.params;

    const initialLength = req.user.savedItems.length;
    req.user.savedItems = req.user.savedItems.filter(
      (item) =>
        String(item._id) !== String(id) &&
        String(item.itemId) !== String(id)
    );

    if (req.user.savedItems.length === initialLength) {
      return res.status(404).json({
        success: false,
        message: "सेव की गई जानकारी नहीं मिली।",
      });
    }

    await req.user.save();

    return res.json({
      success: true,
      message: "सेव की गई जानकारी हटा दी गई।",
      data: req.user.savedItems,
    });
  } catch (error) {
    console.error("Delete saved item error:", error);
    return res.status(500).json({
      success: false,
      message: "जानकारी हटाने में समस्या हुई।",
    });
  }
};

// ----------------------------------------------------
// WATCHLIST
// ----------------------------------------------------
exports.getWatchlist = async (req, res) => {
  try {
    return res.json({
      success: true,
      data: req.user.watchlist || [],
    });
  } catch (error) {
    console.error("Get watchlist error:", error);
    return res.status(500).json({
      success: false,
      message: "Watchlist लोड करने में समस्या हुई।",
    });
  }
};

exports.updateWatchlist = async (req, res) => {
  try {
    const { watchlist, commodity } = req.body;

    if (Array.isArray(watchlist)) {
      req.user.watchlist = watchlist.map((item) => String(item).trim()).filter(Boolean);
    } else if (commodity && typeof commodity === "string") {
      const trimmed = commodity.trim();
      const current = req.user.watchlist || [];
      if (current.includes(trimmed)) {
        req.user.watchlist = current.filter((c) => c !== trimmed);
      } else {
        req.user.watchlist = [...current, trimmed];
      }
    }

    await req.user.save();

    return res.json({
      success: true,
      message: "Watchlist अपडेट हो गई।",
      data: req.user.watchlist,
    });
  } catch (error) {
    console.error("Update watchlist error:", error);
    return res.status(500).json({
      success: false,
      message: "Watchlist अपडेट करने में समस्या हुई।",
    });
  }
};

// ----------------------------------------------------
// DASHBOARD OVERVIEW (DYNAMIC AGGREGATE)
// ----------------------------------------------------
exports.getDashboardOverview = async (req, res) => {
  try {
    const user = req.user;

    // Fetch schemes from DB
    const schemes = await GovernmentScheme.find({
      status: { $in: ["published", "active"] },
    })
      .select("id slug name shortName category description officialUrl sourceUrl")
      .limit(6)
      .lean();

    // Fetch crops from DB to generate dynamic advisories
    const dbCrops = await Crop.find({
      status: "published",
    })
      .select("name season soil description water diseases varieties")
      .lean();

    // Create dynamic advisories based on DB crops
    const advisories = [];
    dbCrops.forEach((crop, idx) => {
      if (crop.diseases && crop.diseases.length > 0) {
        crop.diseases.slice(0, 2).forEach((disease, dIdx) => {
          advisories.push({
            id: `adv-${crop._id}-${dIdx}`,
            crop: crop.name,
            title: `${disease.name} नियंत्रण`,
            description: disease.solution || disease.symptoms || `${crop.name} में ${disease.name} के लक्षण दिखने पर उचित नियंत्रण करें।`,
            type: "रोग प्रबंधन",
          });
        });
      }

      if (crop.soil) {
        advisories.push({
          id: `soil-${crop._id}`,
          crop: crop.name,
          title: `मिट्टी एवं बुवाई सलाह`,
          description: `उपयुक्त मिट्टी: ${crop.soil}। ${crop.description || ""}`.trim(),
          type: "फसल सलाह",
        });
      }
    });

    const formattedSchemes = schemes.map((s) => ({
      id: s.slug || s.id || s._id,
      name: s.name,
      shortName: s.shortName || s.name,
      category: s.category || "सरकारी योजना",
      description: s.description || "",
      url: s.officialUrl || s.sourceUrl || "",
    }));

    return res.json({
      success: true,
      data: {
        farmer: publicUser(user),
        stats: {
          totalLand: `${user.landArea || 0} ${user.landUnit || "Acre"}`,
          landArea: user.landArea || 0,
          landUnit: user.landUnit || "Acre",
          cropsCount: user.crops?.length || 0,
          savedCount: user.savedItems?.length || 0,
          watchlistCount: user.watchlist?.length || 0,
          totalCropExpenses: (user.crops || []).reduce(
            (total, crop) =>
              total + (crop.expenses || []).reduce((sum, expense) => sum + expense.amount, 0),
            0
          ),
        },
        crops: user.crops || [],
        schemes: formattedSchemes,
        advisories: advisories.slice(0, 6),
        watchlist: user.watchlist || [],
      },
    });
  } catch (error) {
    console.error("Dashboard overview error:", error);
    return res.status(500).json({
      success: false,
      message: "डैशबोर्ड डेटा लोड करने में समस्या हुई।",
    });
  }
};
