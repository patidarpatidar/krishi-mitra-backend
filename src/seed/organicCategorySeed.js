require("dotenv").config();

const mongoose = require("mongoose");

const OrganicCategory = require("../models/OrganicCategory");

const categories = [
  {
    name: "प्राकृतिक खाद",
    slug: "fertilizer",
    description: "प्राकृतिक एवं जैविक खाद से संबंधित जानकारी और विधियां।",
    status: "active",
  },
  {
    name: "कीट प्रबंधन",
    slug: "pesticide",
    description:
      "प्राकृतिक एवं जैविक तरीके से कीट प्रबंधन की जानकारी।",
    status: "active",
  },
  {
    name: "फफूंद प्रबंधन",
    slug: "fungicide",
    description:
      "प्राकृतिक तरीकों से फफूंद संबंधी समस्याओं के प्रबंधन की जानकारी।",
    status: "active",
  },
];

const seedCategories = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB connected");

    for (const category of categories) {
      await OrganicCategory.findOneAndUpdate(
        { slug: category.slug },
        category,
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        }
      );
    }

    console.log("Organic categories seeded successfully");

    process.exit(0);
  } catch (error) {
    console.error("Organic category seed error:", error);
    process.exit(1);
  }
};

seedCategories();