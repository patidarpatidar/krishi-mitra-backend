
require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../src/models/User");

async function createAdmin() {
  const {
    MONGODB_URI,
    ADMIN_NAME,
    ADMIN_EMAIL,
    ADMIN_PASSWORD,
    ADMIN_PHONE,
    ADMIN_VILLAGE,
  } = process.env;

  if (
    !MONGODB_URI ||
    !ADMIN_NAME ||
    !ADMIN_EMAIL ||
    !ADMIN_PASSWORD ||
    !ADMIN_PHONE ||
    !ADMIN_VILLAGE
  ) {
    throw new Error(
      "MONGODB_URI and all ADMIN_* environment variables are required"
    );
  }

  if (ADMIN_PASSWORD.length < 12) {
    throw new Error("Admin password must be at least 12 characters");
  }

  await mongoose.connect(MONGODB_URI);

  const email = ADMIN_EMAIL.trim().toLowerCase();
  const phone = ADMIN_PHONE.replace(/\D/g, "");

  let admin = await User.findOne({ email }).select("+password");

  if (admin && admin.role !== "admin") {
    throw new Error(
      "This email already belongs to a non-admin account. Use a separate admin email."
    );
  }

  if (!admin) {
    const phoneOwner = await User.findOne({ phone });

    if (phoneOwner) {
      throw new Error(
        "ADMIN_PHONE already belongs to another account. Configure a unique phone."
      );
    }

    admin = new User({
      name: ADMIN_NAME.trim(),
      email,
      phone,
      village: ADMIN_VILLAGE.trim(),
      district: "Neemuch",
      state: "Madhya Pradesh",
      landArea: 0,
      landUnit: "Acre",
      role: "admin",
      isActive: true,
      password: ADMIN_PASSWORD,
    });
  } else {
    // Explicitly update the password only when rerunning this
    // trusted setup script; the model hashes it on save.
    admin.name = ADMIN_NAME.trim();
    admin.password = ADMIN_PASSWORD;
    admin.isActive = true;
  }

  await admin.save();

  console.log("Admin account is ready:", {
    id: admin._id.toString(),
    email: admin.email,
    role: admin.role,
  });

  await mongoose.disconnect();
}

createAdmin().catch(async (error) => {
  console.error("Admin setup failed:", error.message);

  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect().catch(() => {});
  }

  process.exitCode = 1;
});