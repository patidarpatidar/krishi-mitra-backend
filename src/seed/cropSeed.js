require("dotenv").config();

const connectDB = require("../config/db");
const Crop = require("../models/Crop");
const CropCategory = require("../models/cropCategory");

const categories = [
  {
    name: "अनाज",
    slug: "grain",
    status: "active",
    description: "गेहूँ, मक्का आदि अनाज फसलें",
  },
  {
    name: "तिलहन",
    slug: "oilseed",
    status: "active",
    description: "सोयाबीन, सरसों आदि तिलहन फसलें",
  },
  {
    name: "मसाला",
    slug: "spice",
    status: "active",
    description: "लहसुन, धनिया आदि मसाला फसलें",
  },
  {
    name: "दलहन",
    slug: "pulse",
    status: "active",
    description: "चना, उड़द, मूंग आदि दलहन फसलें",
  },
];

const crops = [
  {
    slug: "garlic",
    name: "लहसुन",
    englishName: "Garlic",
    scientificName: "Allium sativum",
    icon: "🧄",

    category: {
      key: "spice",
      label: "मसाला",
    },

    season: {
      key: "rabi",
      label: "रबी",
    },

    cropType: {
      key: "commercial",
      label: "व्यावसायिक",
    },

    description:
      "नीमच-मंदसौर क्षेत्र की महत्वपूर्ण मसाला फसल। अच्छी गुणवत्ता और भंडारण क्षमता के कारण किसानों के लिए महत्वपूर्ण है।",

    idealSoil:
      "भुरभुरी, उपजाऊ और अच्छी जल निकासी वाली दोमट मिट्टी उपयुक्त रहती है।",

    duration: "130-150 दिन",
    durationDays: 140,

    sowing: "15 अक्टूबर - 15 नवंबर",

    seedRate: "500-600 किग्रा कलियां/हेक्टेयर",

    water: {
      key: "medium",
      label: "मध्यम पानी",
    },

    regions: [
      "Neemuch",
      "Mandsaur",
      "Malwa",
    ],

    regionLabel: "नीमच • मंदसौर • मालवा",

    overview:
      "लहसुन मालवा क्षेत्र, विशेषकर नीमच और मंदसौर की प्रमुख नगदी एवं मसाला फसलों में से एक है।",

    author: "कृषि मित्र टीम",

    publishedAt: new Date("2026-10-03"),

    updatedAtContent: new Date(),

    readTime: "8 मिनट",

    tags: [
      "लहसुन",
      "रबी फसल",
      "नीमच",
      "मंदसौर",
      "मसाला फसल",
    ],

    varieties: [
      {
        name: "जी-2 (G-2 Garlic)",
        yield: "100-120 क्विंटल/हेक्टेयर",
        feature:
          "सफेद और मोटे कंद, अच्छी भंडारण क्षमता।",
      },
      {
        name: "रियावन सिल्वर",
        yield: "120-140 क्विंटल/हेक्टेयर",
        feature:
          "चमकदार सिल्वर रंग और अच्छी बाजार मांग।",
      },
      {
        name: "ऊंटनी लहसुन",
        yield: "130-150 क्विंटल/हेक्टेयर",
        feature:
          "बड़े आकार के कंद और कम कलियां।",
      },
      {
        name: "यमुना सफेद (G-1)",
        yield: "90-110 क्विंटल/हेक्टेयर",
        feature:
          "रोग प्रतिरोधी और विभिन्न मिट्टी में अनुकूल।",
      },
    ],

    soilRequirement:
      "अच्छे जल निकास वाली बलुई दोमट या मध्यम काली मिट्टी। pH 6.0 से 7.0 उपयुक्त माना जाता है।",

    sowingTime:
      "15 अक्टूबर से 15 नवंबर",

    waterRequirement:
      "मृदा और मौसम के अनुसार सामान्यतः 8 से 10 सिंचाइयां आवश्यक हो सकती हैं।",

    seedRate:
      "500-600 किग्रा कलियां प्रति हेक्टेयर",

    harvestingTime:
      "मार्च - अप्रैल",

    topDemandMandi:
      "नीमच, मंदसौर, पिपलिया मंडी",

    diseases: [
      {
        name: "बैंगनी धब्बा रोग",
        symptoms:
          "पत्तियों पर छोटे बैंगनी रंग के धब्बे दिखाई दे सकते हैं।",
        solution:
          "रोग की पुष्टि के बाद कृषि विशेषज्ञ या कृषि विभाग की अनुशंसित विधि अपनाएं।",
      },
      {
        name: "थ्रिप्स",
        symptoms:
          "पत्तियों का पीला पड़ना और ऊपर की ओर मुड़ना।",
        solution:
          "कीट की पुष्टि के बाद स्थानीय कृषि विशेषज्ञ की अनुशंसा के अनुसार नियंत्रण उपाय अपनाएं।",
      },
    ],

    tags: [
      "लहसुन",
      "रबी",
      "मसाला",
      "नीमच",
      "मंदसौर",
    ],

    seo: {
      metaTitle:
        "लहसुन की खेती | किस्म, बुवाई, सिंचाई और उत्पादन",

      metaDescription:
        "लहसुन की खेती की पूरी जानकारी। बुवाई का समय, मिट्टी, बीज दर, सिंचाई, प्रमुख किस्में, रोग और उत्पादन की जानकारी।",

      keywords: [
        "लहसुन की खेती",
        "लहसुन की किस्म",
        "लहसुन की बुवाई",
        "लहसुन उत्पादन",
        "Neemuch garlic",
        "Mandsaur garlic",
      ],

      focusKeyword: "लहसुन की खेती",

      canonicalUrl:
        "https://your-domain.com/crops/garlic",

      ogTitle:
        "लहसुन की खेती की पूरी जानकारी",

      ogDescription:
        "लहसुन की बुवाई, किस्म, सिंचाई, रोग और उत्पादन की जानकारी।",

      ogImage: "",

      twitterTitle:
        "लहसुन की खेती | कृषि मित्र",

      twitterDescription:
        "लहसुन की खेती से जुड़ी महत्वपूर्ण कृषि जानकारी।",

      twitterImage: "",

      schemaType: "Article",

      allowIndex: true,
      allowFollow: true,
    },

    featured: true,
    status: "published",

    views: 18320,
    likes: 1260,
  },

  {
    slug: "soyabean",
    name: "सोयाबीन",
    englishName: "Soyabean",
    scientificName: "Glycine max",
    icon: "🌱",

    category: {
      key: "oilseed",
      label: "तिलहन",
    },

    season: {
      key: "kharif",
      label: "खरीफ",
    },

    cropType: {
      key: "commercial",
      label: "व्यावसायिक",
    },

    description:
      "मध्य प्रदेश की प्रमुख खरीफ तिलहन फसल। यह प्रोटीन और खाद्य तेल का महत्वपूर्ण स्रोत है।",

    idealSoil:
      "मध्यम से गहरी काली मिट्टी जिसमें जल निकास की अच्छी व्यवस्था हो।",

    duration: "90-110 दिन",
    durationDays: 100,

    sowing:
      "20 जून - 15 जुलाई",

    seedRate:
      "75-80 किग्रा/हेक्टेयर",

    water: {
      key: "rainfed",
      label: "वर्षा आधारित",
    },

    regions: [
      "Neemuch",
      "Mandsaur",
      "Malwa",
      "Indore",
    ],

    regionLabel:
      "नीमच • मंदसौर • मालवा • इंदौर",

    overview:
      "सोयाबीन मध्य प्रदेश की प्रमुख खरीफ फसलों में से एक है और क्षेत्र के किसानों के लिए महत्वपूर्ण तिलहन फसल है।",

    author: "कृषि मित्र टीम",

    publishedAt: new Date("2026-10-03"),

    updatedAtContent: new Date(),

    readTime: "7 मिनट",

    tags: [
      "सोयाबीन",
      "खरीफ",
      "तिलहन",
      "नीमच",
      "मंदसौर",
    ],

    varieties: [
      {
        name: "JS 20-34",
        yield: "20-25 क्विंटल/हेक्टेयर",
        feature:
          "कम अवधि में पकने वाली और सूखा सहनशील।",
      },
      {
        name: "JS 20-29",
        yield: "25-30 क्विंटल/हेक्टेयर",
        feature:
          "रोग प्रतिरोधी और अच्छी फलियां।",
      },
      {
        name: "NRC 86",
        yield: "22-26 क्विंटल/हेक्टेयर",
        feature:
          "पीला मोज़ेक रोग के प्रति बेहतर प्रतिरोध।",
      },
    ],

    soilRequirement:
      "मध्यम से गहरी काली मिट्टी जिसमें जल निकास की अच्छी व्यवस्था हो।",

    sowingTime:
      "मानसून की पर्याप्त वर्षा के बाद सामान्यतः जून से जुलाई के बीच।",

    waterRequirement:
      "मुख्यतः वर्षा आधारित फसल है। आवश्यकता के अनुसार महत्वपूर्ण वृद्धि अवस्थाओं में सिंचाई की जा सकती है।",

    seedRate:
      "75-80 किग्रा प्रति हेक्टेयर",

    harvestingTime:
      "सितंबर - अक्टूबर",

    topDemandMandi:
      "उज्जैन, नीमच, इंदौर मंडी",

    diseases: [
      {
        name: "पीला मोज़ेक वायरस",
        symptoms:
          "पत्तियों पर पीले रंग के चकत्ते दिखाई दे सकते हैं और पौधे की वृद्धि प्रभावित हो सकती है।",
        solution:
          "रोग की पुष्टि और नियंत्रण के लिए कृषि विशेषज्ञ या कृषि विभाग की अनुशंसा अपनाएं।",
      },
    ],

    seo: {
      metaTitle:
        "सोयाबीन की खेती | बुवाई, किस्म, उत्पादन और देखभाल",

      metaDescription:
        "सोयाबीन की खेती की पूरी जानकारी। बुवाई का समय, बीज दर, मिट्टी, किस्में, सिंचाई, रोग और उत्पादन की जानकारी।",

      keywords: [
        "सोयाबीन की खेती",
        "सोयाबीन की किस्म",
        "सोयाबीन बुवाई",
        "सोयाबीन उत्पादन",
        "Soybean farming MP",
        "Neemuch soybean",
      ],

      focusKeyword:
        "सोयाबीन की खेती",

      canonicalUrl:
        "https://your-domain.com/crops/soyabean",

      ogTitle:
        "सोयाबीन की खेती की पूरी जानकारी",

      ogDescription:
        "सोयाबीन की बुवाई, किस्म, सिंचाई, रोग और उत्पादन की जानकारी।",

      ogImage: "",

      twitterTitle:
        "सोयाबीन की खेती | कृषि मित्र",

      twitterDescription:
        "सोयाबीन की खेती से जुड़ी महत्वपूर्ण जानकारी।",

      twitterImage: "",

      schemaType: "Article",

      allowIndex: true,
      allowFollow: true,
    },

    featured: true,
    status: "published",

    views: 12450,
    likes: 842,
  },
];

const seedDatabase = async () => {
  try {
    await connectDB();

    console.log("Clearing old crop data...");

    await Crop.deleteMany({});
    await CropCategory.deleteMany({});

    console.log("Inserting categories...");

    await CropCategory.insertMany(categories);

    console.log("Inserting crops...");

    await Crop.insertMany(crops);

    console.log("Crop seed completed successfully.");

    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
};

seedDatabase();