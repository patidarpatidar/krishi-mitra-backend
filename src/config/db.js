const mongoose = require("mongoose");
const ContentEngagement = require("../models/ContentEngagement");
const LivestockEngagement = require("../models/LivestockEngagement");

const connectDB = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGODB_URI);
    await Promise.all([
      ContentEngagement.createIndexes(),
      LivestockEngagement.createIndexes(),
    ]);

    console.log(`MongoDB Connected: ${connection.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;