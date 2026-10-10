const mongoose = require("mongoose");

const subscriberSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: 254,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      unique: true,
      sparse: true,
    },
    mobile: {
      type: String,
      match: /^[6-9]\d{9}$/,
      unique: true,
      sparse: true,
    },
    status: {
      type: String,
      enum: ["subscribed", "unsubscribed"],
      default: "subscribed",
      index: true,
    },
    source: {
      type: String,
      default: "footer",
      trim: true,
      maxlength: 50,
    },
  },
  { timestamps: true },
);

module.exports =
  mongoose.models.Subscriber ||
  mongoose.model("Subscriber", subscriberSchema);
