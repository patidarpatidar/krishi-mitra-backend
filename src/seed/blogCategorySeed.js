
const BlogCategory = require("../models/BlogCategory");

const categories = [
  {
    label: "फसल सुरक्षा",
    slug: "fasal-suraksha",
    icon: "🛡️",
    description: "फसलों के कीट, रोग और सुरक्षा से जुड़ी जानकारी।",
    status: "active",
    sortOrder: 1,
  },
  {
    label: "फसल प्रबंधन",
    slug: "fasal-prabandhan",
    icon: "🌾",
    description: "बुवाई, सिंचाई, कटाई और भंडारण के तरीके।",
    status: "active",
    sortOrder: 2,
  },
  {
    label: "जैविक खेती",
    slug: "jaivik-kheti",
    icon: "🌱",
    description: "जैविक और प्राकृतिक खेती से संबंधित जानकारी।",
    status: "active",
    sortOrder: 3,
  },
  {
    label: "कृषि तकनीक",
    slug: "krishi-takneek",
    icon: "🚜",
    description: "आधुनिक कृषि उपकरण और तकनीक।",
    status: "active",
    sortOrder: 4,
  },
];

async function seedBlogCategories() {
  for (const category of categories) {
    await BlogCategory.updateOne(
      { slug: category.slug },
      { $setOnInsert: category },
      { upsert: true, runValidators: true }
    );
  }

  const count = await BlogCategory.countDocuments();

  console.log("Blog categories seed completed.");
  console.log(`Total categories in database: ${count}`);
}

module.exports = seedBlogCategories;