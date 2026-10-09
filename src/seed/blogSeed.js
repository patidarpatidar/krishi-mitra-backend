
const fs = require("fs");
const path = require("path");

const Blog = require("../models/Blog");
const BlogCategory = require("../models/BlogCategory");

const dataPath = path.join(__dirname, "data", "blogs.json");

async function seedBlogs() {
  if (!fs.existsSync(dataPath)) {
    throw new Error(
      "Missing src/seed/data/blogs.json. Add the existing blogsData array as valid JSON."
    );
  }

  const blogsData = JSON.parse(
    fs.readFileSync(dataPath, "utf8")
  );

  if (!Array.isArray(blogsData)) {
    throw new Error("blogs.json must contain a JSON array.");
  }

  const categoryMap = new Map();

  const categories = await BlogCategory.find({}).lean();

  for (const category of categories) {
    categoryMap.set(category.label, category);
  }

  for (const item of blogsData) {
    const category = categoryMap.get(item.category);

    if (!category) {
      throw new Error(
        `Category "${item.category}" not found. Run blogCategorySeed first.`
      );
    }

    const blogData = {
      slug: item.slug,
      title: item.title,
      categoryId: category._id,
      category: category.label,
      date: item.date ? new Date(item.date) : new Date(),
      author: item.author || "",
      authorRole: item.authorRole || "",
      authorAvatar: item.authorAvatar || "👨‍🌾",
      readTime: item.readTime || 1,
      views: item.views || 0,
      likes: item.likes || 0,
      comments: item.comments || 0,
      hasVideo: Boolean(item.hasVideo),
      hasGallery: Boolean(item.hasGallery),
      isFeatured: Boolean(item.isFeatured),
      coverImage: item.coverImage || "",
      excerpt: item.excerpt || "",
      tags: item.tags || [],
      content: {
        introduction: item.content?.introduction || "",
        sections: item.content?.sections || [],
        safetyNote: item.content?.safetyNote || "",
        faqs: item.content?.faqs || [],
      },
      galleryImages: item.galleryImages || [],
      youtubeVideoId: item.youtubeVideoId || "",
      calculator: item.calculator || { enabled: false },
      status: "published",
      publishedAt: item.date ? new Date(item.date) : new Date(),
      updatedAtContent: new Date(),
    };

    // Add only if this slug doesn't already exist.
    // Rerunning the seed will not overwrite Admin edits.
    await Blog.updateOne(
      { slug: item.slug },
      { $setOnInsert: blogData },
      { upsert: true, runValidators: true }
    );
  }

  console.log(`Processed ${blogsData.length} blog seed records.`);
}

module.exports = seedBlogs;