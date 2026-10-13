const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const cropRoutes = require("./routes/cropRoutes");
const cropCategoryRoutes = require("./routes/cropCategoryRoutes");
const errorMiddleware = require("./middleware/errorMiddleware");
const schemeCategoryRoutes = require("./routes/schemeCategoryRoutes");
const governmentSchemeRoutes = require("./routes/governmentSchemeRoutes");
const organicRecipeRoutes = require("./routes/organicRecipeRoutes");
const organicCategoryRoutes = require("./routes/organicCategoryRoutes");
const blogRoutes = require("./routes/blogRoutes");
const blogCategoryRoutes = require("./routes/blogCategoryRoutes");
const inquiryRoutes = require("./routes/inquiryRoutes");
const subscriberRoutes = require("./routes/subscriberRoutes");
const livestockRoutes = require("./routes/livestockRoutes");
const livestockCategoryRoutes = require("./routes/livestockCategoryRoutes");
const farmerRoutes = require("./routes/farmerRoutes");
const adminUserRoutes = require("./routes/adminUserRoutes");

const app = express();


const allowedOrigins = [
  "https://krishi-mitra-nu-black.vercel.app",
  "http://localhost:3000",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.error("CORS blocked origin:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/farmer", farmerRoutes);
app.use("/api/admin", require("./routes/adminAnalyticsRoutes"));
app.use("/api/admin/farmers", adminUserRoutes);

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Kisan Mitra API is running",
  });
});

app.use("/api/crops", cropRoutes);
app.use(
  "/api/scheme-categories",
  schemeCategoryRoutes
);
app.use(
  "/api/crop-categories",
  cropCategoryRoutes
);
app.use(
  "/api/schemes",
  governmentSchemeRoutes
);

app.use(
  "/api/organic-recipes",
  organicRecipeRoutes
);

app.use(
  "/api/organic-categories",
  organicCategoryRoutes
);
app.use("/api/blogs", blogRoutes);
app.use("/api/blog-categories", blogCategoryRoutes);
app.use("/api/inquiries", inquiryRoutes);
app.use("/api/subscribers", subscriberRoutes);
app.use("/api/livestock", livestockRoutes);
app.use("/api/livestock-categories", livestockCategoryRoutes);
app.use(errorMiddleware);

module.exports = app;