
const mongoose = require("mongoose");
const seedBlogCategories = require("./blogCategorySeed");
const seedBlogs = require("./blogSeed");

async function main() {
  try {
    require("dotenv").config();

    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error("MONGO_URI or MONGODB_URI is missing in .env");
    }

    await mongoose.connect(mongoUri);
    console.log("MongoDB connected");

    await seedBlogCategories();
    console.log("Blog categories seeded");

    await seedBlogs();
    console.log("Blogs seeded");

    console.log("All blog seeds completed successfully");
  } catch (error) {
    console.error("Blog seed failed:", error.message);
    process.exitCode = 1;
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  }
}

main();