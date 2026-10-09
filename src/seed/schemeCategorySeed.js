require("dotenv").config();

const mongoose = require("mongoose");
const SchemeCategory = require("../models/SchemeCategory");

const categories = [
  {
    name: "किसान सहायता",
    slug: "kisan-sahayata",
    description:
      "किसानों को आय सहायता और अन्य प्रत्यक्ष सहायता प्रदान करने वाली सरकारी योजनाएं।",
    status: "active",
  },

  {
    name: "फसल बीमा",
    slug: "fasal-bima",
    description:
      "फसल नुकसान और कृषि जोखिम से संबंधित सरकारी बीमा योजनाएं।",
    status: "active",
  },

  {
    name: "कृषि ऋण",
    slug: "krishi-rin",
    description:
      "किसानों को कृषि एवं allied activities के लिए credit और loan से संबंधित योजनाएं।",
    status: "active",
  },

  {
    name: "मध्य प्रदेश योजना",
    slug: "madhya-pradesh-yojana",
    description:
      "मध्य प्रदेश शासन द्वारा किसानों के लिए संचालित योजनाएं।",
    status: "active",
  },
];

const seedCategories = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI
    );

    console.log("MongoDB connected");

    for (const category of categories) {
      await SchemeCategory.findOneAndUpdate(
        { slug: category.slug },
        category,
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        }
      );
    }

    console.log(
      `${categories.length} scheme categories seeded successfully`
    );

    await mongoose.disconnect();

    process.exit(0);
  } catch (error) {
    console.error(
      "Scheme category seed error:",
      error.message
    );

    process.exit(1);
  }
};

seedCategories();