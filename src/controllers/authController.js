
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const COOKIE_NAME = "km_token";

function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 24 * 60 * 60 * 1000,
  };
}

function signToken(user) {
  return jwt.sign(
    { role: user.role },
    process.env.JWT_SECRET,
    {
      subject: user._id.toString(),
      expiresIn: process.env.JWT_EXPIRES_IN || "1d",
    }
  );
}

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
    landArea: user.landArea,
    landUnit: user.landUnit,
    irrigation: user.irrigation || "",
    crops: user.crops || [],
    savedItems: user.savedItems || [],
    watchlist: user.watchlist || ["सोयाबीन", "लहसुन", "गेहूँ"],
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

exports.register = async (req, res) => {
  try {
    const {
      name,
      phone,
      email,
      password,
      village,
      district,
      state,
      pincode,
      landArea,
      landUnit,
      irrigation,
    } = req.body;

    if (
      !name?.trim() ||
      !phone ||
      !email?.trim() ||
      !password ||
      !village?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "कृपया सभी जरूरी जानकारी भरें।",
      });
    }

    const normalizedPhone = String(phone).replace(/\D/g, "");
    const normalizedEmail = String(email).trim().toLowerCase();

    if (!/^[6-9]\d{9}$/.test(normalizedPhone)) {
      return res.status(400).json({
        success: false,
        message: "सही 10 digit मोबाइल नंबर दर्ज करें।",
      });
    }

    if (typeof password !== "string" || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "पासवर्ड कम से कम 6 characters का होना चाहिए।",
      });
    }

    if (password.length > 128) {
      return res.status(400).json({
        success: false,
        message: "पासवर्ड बहुत लंबा है।",
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Valid email दर्ज करें।",
      });
    }

    const existing = await User.findOne({
      $or: [
        { phone: normalizedPhone },
        { email: normalizedEmail },
      ],
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "यह मोबाइल नंबर या ईमेल पहले से registered है।",
      });
    }

    const parsedLandArea =
      landArea === undefined || landArea === ""
        ? 0
        : Number(landArea);

    if (
      !Number.isFinite(parsedLandArea) ||
      parsedLandArea < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "भूमि का क्षेत्रफल सही दर्ज करें।",
      });
    }

    const allowedUnits = ["Acre", "Bigha", "Hectare"];
    const selectedUnit = landUnit || "Acre";

    if (!allowedUnits.includes(selectedUnit)) {
      return res.status(400).json({
        success: false,
        message: "भूमि की इकाई सही नहीं है।",
      });
    }

    const user = await User.create({
      name: name.trim(),
      phone: normalizedPhone,
      email: normalizedEmail,
      password,
      village: village.trim(),
      district: district?.trim() || "Neemuch",
      state: state?.trim() || "Madhya Pradesh",
      pincode: pincode?.trim() || "",
      irrigation: irrigation?.trim() || "",
      landArea: parsedLandArea,
      landUnit: selectedUnit,

      // Never accept role from public registration.
      role: "farmer",
    });

    const token = signToken(user);
    res.cookie(COOKIE_NAME, token, cookieOptions());

    return res.status(201).json({
      success: true,
      message: "Registration सफल रहा।",
      data: {
        token,
        user: publicUser(user),
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "यह मोबाइल नंबर या ईमेल पहले से registered है।",
      });
    }

    console.error("Register error:", error);

    return res.status(500).json({
      success: false,
      message: "Registration के दौरान समस्या हुई।",
    });
  }
};

exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Admin email और password भरें।",
      });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured");
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    }).select("+password");

    if (
      !user ||
      user.role !== "admin" ||
      !user.isActive ||
      !(await user.comparePassword(password))
    ) {
      return res.status(401).json({
        success: false,
        message: "Admin email या password गलत है।",
      });
    }

    const token = jwt.sign(
      { role: user.role },
      process.env.JWT_SECRET,
      {
        subject: user._id.toString(),
        expiresIn: process.env.JWT_EXPIRES_IN || "1d",
      }
    );

    return res.status(200).json({
      success: true,
      message: "Admin login सफल रहा।",
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error("Admin login error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Login के दौरान server error हुआ।",
    });
  }
};
exports.login = async (req, res) => {
  try {
    const { login, password } = req.body;

    if (
      typeof login !== "string" ||
      !login.trim() ||
      typeof password !== "string" ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "मोबाइल/ईमेल और पासवर्ड भरें।",
      });
    }

    const value = login.trim();
    const normalizedEmail = value.toLowerCase();
    const normalizedPhone = value.replace(/\D/g, "");

    const user = await User.findOne({
      $or: [
        { email: normalizedEmail },
        { phone: normalizedPhone },
      ],
    }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: "मोबाइल/ईमेल या पासवर्ड गलत है।",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "यह अकाउंट निष्क्रिय है।",
      });
    }

    const token = signToken(user);

    res.cookie(COOKIE_NAME, token, cookieOptions());

    return res.json({
      success: true,
      message: "Login सफल रहा।",
      data: {
        token,
        user: publicUser(user),
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Login के दौरान समस्या हुई।",
    });
  }
};

exports.me = async (req, res) => {
  return res.json({
    success: true,
    data: { user: publicUser(req.user) },
  });
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
          message: "यह मोबाइल नंबर पहले से किसी अन्य अकाउंट में मौजूद है।",
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
          message: "यह ईमेल पहले से किसी अन्य अकाउंट में मौजूद है।",
        });
      }

      user.email = normalizedEmail;
    }

    await user.save();

    return res.json({
      success: true,
      message: "Profile सफलतापूर्वक अपडेट हो गई।",
      data: { user: publicUser(user) },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(500).json({
      success: false,
      message: "Profile अपडेट के दौरान समस्या हुई।",
    });
  }
};

exports.logout = async (req, res) => {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  return res.json({
    success: true,
    message: "Logout सफल रहा।",
  });
};