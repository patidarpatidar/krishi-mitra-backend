
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: /^[6-9]\d{9}$/,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },
    village: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    district: {
      type: String,
      default: "Neemuch",
      trim: true,
    },
    state: {
      type: String,
      default: "Madhya Pradesh",
      trim: true,
    },
    pincode: {
      type: String,
      default: "",
      trim: true,
    },
    irrigation: {
      type: String,
      default: "",
      trim: true,
    },
    landArea: {
      type: Number,
      default: 0,
      min: 0,
    },
    landUnit: {
      type: String,
      enum: ["Acre", "Bigha", "Hectare"],
      default: "Acre",
    },
    role: {
      type: String,
      enum: ["farmer", "admin"],
      default: "farmer",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    crops: [
      {
        name: { type: String, required: true, trim: true },
        area: { type: Number, default: 0 },
        season: { type: String, default: "खरीफ" },
        status: { type: String, default: "बुवाई की तैयारी" },
        sowingDate: { type: String, default: "" },
        estimatedProductionQuintals: { type: Number, default: 0, min: 0 },
        expectedSalePrice: { type: Number, default: 0, min: 0 },
        isArchived: { type: Boolean, default: false },
        archivedAt: { type: Date, default: null },
        expenses: [
          {
            category: { type: String, required: true, trim: true, maxlength: 80 },
            stage: { type: String, trim: true, default: "बुवाई", maxlength: 80 },
            amount: { type: Number, required: true, min: 0.01 },
            date: { type: Date, required: true, default: Date.now },
            note: { type: String, trim: true, default: "", maxlength: 300 },
            createdAt: { type: Date, default: Date.now },
          },
        ],
        createdAt: { type: Date, default: Date.now },
      },
    ],
    savedItems: [
      {
        itemId: { type: String, trim: true },
        type: { type: String, default: "scheme" },
        title: { type: String, required: true, trim: true },
        category: { type: String, default: "" },
        url: { type: String, default: "" },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    watchlist: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true, versionKey: false }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("User", userSchema);