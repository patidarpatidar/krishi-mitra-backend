
const mongoose = require("mongoose");
const crypto = require("crypto");

const inquirySchema = new mongoose.Schema(
  {
    inquiryNumber: {
      type: String,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      maxlength: 20,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
      maxlength: 150,
    },
    district: {
      type: String,
      required: true,
      enum: ["Neemuch", "Mandsaur", "Ratlam", "Ujjain"],
    },
    queryType: {
      type: String,
      required: true,
      enum: [
        "Mandi Bhav",
        "Crop Advisory",
        "Weather",
        "Government Scheme",
        "Blog Feedback",
        "Other",
      ],
    },
    subject: {
      type: String,
      trim: true,
      default: "",
      maxlength: 150,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 3000,
    },
    status: {
      type: String,
      enum: ["new", "in-progress", "resolved", "closed"],
      default: "new",
      index: true,
    },
    priority: {
      type: String,
      enum: ["low", "normal", "high"],
      default: "normal",
    },
    adminNotes: {
      type: String,
      default: "",
      maxlength: 3000,
    },
    assignedTo: {
      type: String,
      default: "",
      trim: true,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

inquirySchema.pre("validate", function () {
  if (!this.inquiryNumber) {
    this.inquiryNumber =
      "KM-" +
      Date.now().toString().slice(-8) +
      "-" +
      crypto.randomBytes(2).toString("hex").toUpperCase();
  }
});

module.exports =
  mongoose.models.Inquiry ||
  mongoose.model("Inquiry", inquirySchema);