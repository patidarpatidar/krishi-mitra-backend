require("dotenv").config();

const mongoose = require("mongoose");

const OrganicRecipe = require("../models/OrganicRecipe");
const OrganicCategory = require("../models/OrganicCategory");

const recipes = [
  {
    id: "jeevamrut",
    slug: "jeevamrut",
    title: "जीवामृत (Jeevamrut)",
    titleEn: "Jeevamrut",
    type: "प्राकृतिक तरल खाद",
    category: "fertilizer",
    target: "मृदा स्वास्थ्य, सूक्ष्मजीव वृद्धि, फसल पोषण",
    shelfLife: "10–12 दिन",

    costMin: 100,
    costMax: 150,

    baseArea: 1,
    baseAreaUnit: "acre",

    baseWater: 200,
    baseWaterUnit: "लीटर",

    baseIngredients: [
      {
        name: "देसी गाय का ताजा गोबर",
        amount: 10,
        unit: "किग्रा",
      },
      {
        name: "पुराना गौमूत्र",
        amount: 10,
        unit: "लीटर",
      },
      {
        name: "गुड़",
        amount: 2,
        unit: "किग्रा",
      },
      {
        name: "बेसन",
        amount: 2,
        unit: "किग्रा",
      },
      {
        name: "उपजाऊ मिट्टी",
        amount: 1,
        unit: "किग्रा",
      },
    ],

    processSteps: [
      "200 लीटर ड्रम में स्वच्छ पानी भरें।",
      "गोबर और गौमूत्र का घोल बनाकर ड्रम में मिलाएं।",
      "गुड़ और बेसन को अलग पानी में घोलकर मिलाएं।",
      "अंत में उपजाऊ मिट्टी मिलाएं।",
      "छायादार स्थान पर रखें और समय-समय पर लकड़ी से चलाएं।",
    ],

    usage:
      "सिंचाई के पानी के साथ या उचित रूप से छानकर फसल पर प्रयोग किया जाता है।",

    precautions:
      "छायादार स्थान में रखें और तैयार घोल की गुणवत्ता, स्वच्छता तथा फसल के लिए उपयुक्त मात्रा का ध्यान रखें।",

    featured: true,
    status: "active",

    seo: {
      metaTitle: "जीवामृत बनाने की विधि | जैविक खेती",
      metaDescription:
        "जीवामृत क्या है, इसे बनाने की विधि, सामग्री, लागत और जैविक खेती में उपयोग की जानकारी।",
      keywords: [
        "जीवामृत",
        "जीवामृत बनाने की विधि",
        "जैविक खेती",
        "प्राकृतिक खाद",
      ],
      focusKeyword: "जीवामृत बनाने की विधि",
      schemaType: "Article",
      allowIndex: true,
      allowFollow: true,
    },
  },

  {
    id: "neemastra",
    slug: "neemastra",
    title: "नीमास्त्र (Neemastra)",
    titleEn: "Neemastra",
    type: "जैविक कीट प्रबंधन",
    category: "pesticide",
    target: "रसचूसक कीट, थ्रिप्स, सफेद मक्खी आदि",
    shelfLife: "निर्माता निर्देश अनुसार",

    costMin: 50,
    costMax: 80,

    baseArea: 1,
    baseAreaUnit: "acre",

    baseWater: 100,
    baseWaterUnit: "लीटर",

    baseIngredients: [
      {
        name: "गौमूत्र",
        amount: 5,
        unit: "लीटर",
      },
      {
        name: "ताजा गोबर",
        amount: 1,
        unit: "किग्रा",
      },
      {
        name: "नीम पत्ती पेस्ट",
        amount: 5,
        unit: "किग्रा",
      },
    ],

    processSteps: [
      "पानी में गौमूत्र और गोबर मिलाएं।",
      "नीम पत्ती का पेस्ट मिलाएं।",
      "छायादार स्थान में मिश्रण रखें।",
      "छानकर प्रयोग से पहले फसल और स्थानीय कृषि सलाह के अनुसार उपयोग करें।",
    ],

    usage:
      "उपयोग से पहले फसल, कीट और स्थानीय कृषि विशेषज्ञ की सलाह के अनुसार घोल की मात्रा निर्धारित करें।",

    precautions:
      "पहले छोटे हिस्से पर परीक्षण करें। तेज धूप, तेज हवा या बारिश के समय छिड़काव न करें।",

    featured: false,
    status: "active",

    seo: {
      metaTitle: "नीमास्त्र बनाने की विधि | जैविक कीट प्रबंधन",
      metaDescription:
        "नीमास्त्र बनाने की सामग्री, विधि और जैविक खेती में कीट प्रबंधन के लिए उपयोग की जानकारी।",
      keywords: [
        "नीमास्त्र",
        "नीमास्त्र बनाने की विधि",
        "जैविक कीट प्रबंधन",
      ],
      focusKeyword: "नीमास्त्र",
      schemaType: "Article",
      allowIndex: true,
      allowFollow: true,
    },
  },

  {
    id: "brahmastra",
    slug: "brahmastra",
    title: "ब्रह्मास्त्र (Brahmastra)",
    titleEn: "Brahmastra",
    type: "प्राकृतिक कीट प्रबंधन",
    category: "pesticide",
    target: "इल्लियां और अन्य कीट",
    shelfLife: "निर्माता निर्देश अनुसार",

    costMin: 120,
    costMax: 180,

    baseArea: 1,
    baseAreaUnit: "acre",

    baseWater: 100,
    baseWaterUnit: "लीटर",

    baseIngredients: [
      {
        name: "गौमूत्र",
        amount: 10,
        unit: "लीटर",
      },
      {
        name: "नीम पत्ती पेस्ट",
        amount: 3,
        unit: "किग्रा",
      },
      {
        name: "करंज/अरंडी पत्ती पेस्ट",
        amount: 2,
        unit: "किग्रा",
      },
      {
        name: "सीताफल पत्ती पेस्ट",
        amount: 2,
        unit: "किग्रा",
      },
      {
        name: "अन्य कड़वी पत्तियों का पेस्ट",
        amount: 2,
        unit: "किग्रा",
      },
    ],

    processSteps: [
      "सभी सामग्री को उचित पात्र में मिलाएं।",
      "मिश्रण को छायादार स्थान पर रखें।",
      "निर्धारित अवधि में मिश्रण को स्वच्छ तरीके से संभालें।",
      "छानकर उपयोग से पहले स्थानीय कृषि सलाह लें।",
    ],

    usage:
      "फसल एवं कीट की स्थिति के अनुसार कृषि विशेषज्ञ की सलाह से उपयोग करें।",

    precautions:
      "किसी भी जैविक कीट-प्रबंधन घोल को पहले छोटे क्षेत्र पर परीक्षण करें और सुरक्षात्मक दस्ताने/कपड़े का उपयोग करें।",

    featured: false,
    status: "active",

    seo: {
      metaTitle: "ब्रह्मास्त्र बनाने की विधि | प्राकृतिक कीट प्रबंधन",
      metaDescription:
        "ब्रह्मास्त्र की सामग्री, बनाने की विधि और प्राकृतिक कीट प्रबंधन में उपयोग की जानकारी।",
      keywords: [
        "ब्रह्मास्त्र",
        "ब्रह्मास्त्र बनाने की विधि",
        "प्राकृतिक कीट प्रबंधन",
      ],
      focusKeyword: "ब्रह्मास्त्र",
      schemaType: "Article",
      allowIndex: true,
      allowFollow: true,
    },
  },

  {
    id: "agniastra",
    slug: "agniastra",
    title: "अग्निअस्त्र (Agniastra)",
    titleEn: "Agniastra",
    type: "प्राकृतिक कीट प्रबंधन",
    category: "pesticide",
    target: "इल्ली एवं पत्ती खाने वाले कीट",
    shelfLife: "निर्माता निर्देश अनुसार",

    costMin: 150,
    costMax: 200,

    baseArea: 1,
    baseAreaUnit: "acre",

    baseWater: 100,
    baseWaterUnit: "लीटर",

    baseIngredients: [
      {
        name: "गौमूत्र",
        amount: 10,
        unit: "लीटर",
      },
      {
        name: "तीखी मिर्च पेस्ट",
        amount: 500,
        unit: "ग्राम",
      },
      {
        name: "लहसुन पेस्ट",
        amount: 250,
        unit: "ग्राम",
      },
      {
        name: "नीम पत्ती पेस्ट",
        amount: 2,
        unit: "किग्रा",
      },
    ],

    processSteps: [
      "सभी सामग्री को उचित पात्र में मिलाएं।",
      "मिश्रण को सुरक्षित स्थान पर रखें।",
      "छानकर प्रयोग से पहले उचित dilution और crop-safety की पुष्टि करें।",
    ],

    usage:
      "फसल और कीट की स्थिति के अनुसार कृषि विशेषज्ञ/लेबल निर्देश के अनुसार उपयोग करें।",

    precautions:
      "आंखों, त्वचा और सांस के संपर्क से बचें। दस्ताने और अन्य उचित सुरक्षा उपकरण पहनें। बच्चों से दूर रखें।",

    featured: false,
    status: "active",

    seo: {
      metaTitle: "अग्निअस्त्र बनाने की विधि | प्राकृतिक कीट प्रबंधन",
      metaDescription:
        "अग्निअस्त्र की सामग्री, बनाने की प्रक्रिया और प्राकृतिक कीट प्रबंधन में उपयोग की जानकारी।",
      keywords: [
        "अग्निअस्त्र",
        "अग्निअस्त्र बनाने की विधि",
        "प्राकृतिक कीट प्रबंधन",
      ],
      focusKeyword: "अग्निअस्त्र",
      schemaType: "Article",
      allowIndex: true,
      allowFollow: true,
    },
  },

  {
    id: "dashparni",
    slug: "dashparni",
    title: "दशपर्णी अर्क (Dashparni Arka)",
    titleEn: "Dashparni Arka",
    type: "प्राकृतिक कीट प्रबंधन अर्क",
    category: "pesticide",
    target: "विभिन्न प्रकार के कीट",
    shelfLife: "निर्माता निर्देश अनुसार",

    costMin: 200,
    costMax: 250,

    baseArea: 1,
    baseAreaUnit: "acre",

    baseWater: 200,
    baseWaterUnit: "लीटर",

    baseIngredients: [
      {
        name: "पानी",
        amount: 200,
        unit: "लीटर",
      },
      {
        name: "गौमूत्र",
        amount: 20,
        unit: "लीटर",
      },
      {
        name: "गोबर",
        amount: 2,
        unit: "किग्रा",
      },
      {
        name: "कड़वी/औषधीय पत्तियों का मिश्रण",
        amount: 20,
        unit: "किग्रा",
      },
      {
        name: "हल्दी",
        amount: 500,
        unit: "ग्राम",
      },
      {
        name: "अदरक/सोंठ",
        amount: 500,
        unit: "ग्राम",
      },
    ],

    processSteps: [
      "सामग्री को स्वच्छ पात्र में मिलाएं।",
      "छायादार स्थान पर fermentation के लिए रखें।",
      "मिश्रण को स्वच्छ तरीके से संभालें।",
      "उपयोग से पहले अच्छी तरह छानें।",
    ],

    usage:
      "फसल एवं कीट स्थिति के अनुसार कृषि विशेषज्ञ की सलाह से उपयोग करें।",

    precautions:
      "लंबे fermentation के दौरान पात्र को स्वच्छ रखें और बच्चों/पशुओं की पहुंच से दूर रखें।",

    featured: false,
    status: "active",

    seo: {
      metaTitle: "दशपर्णी अर्क बनाने की विधि | प्राकृतिक कीट प्रबंधन",
      metaDescription:
        "दशपर्णी अर्क की सामग्री, बनाने की विधि और प्राकृतिक कीट प्रबंधन में उपयोग की जानकारी।",
      keywords: [
        "दशपर्णी अर्क",
        "दशपर्णी अर्क बनाने की विधि",
        "जैविक खेती",
      ],
      focusKeyword: "दशपर्णी अर्क",
      schemaType: "Article",
      allowIndex: true,
      allowFollow: true,
    },
  },

  {
    id: "sont-astra",
    slug: "sont-astra",
    title: "सोंठ-दूध / छाछ फफूंद प्रबंधन",
    titleEn: "Sonth Milk / Buttermilk Fungal Management",
    type: "प्राकृतिक फफूंद प्रबंधन",
    category: "fungicide",
    target: "कुछ फफूंदजनित समस्याएं",
    shelfLife: "ताजा तैयार करना बेहतर",

    costMin: 80,
    costMax: 120,

    baseArea: 1,
    baseAreaUnit: "acre",

    baseWater: 100,
    baseWaterUnit: "लीटर",

    baseIngredients: [
      {
        name: "दूध / छाछ",
        amount: 5,
        unit: "लीटर",
      },
      {
        name: "सोंठ पाउडर",
        amount: 200,
        unit: "ग्राम",
      },
      {
        name: "पानी",
        amount: 100,
        unit: "लीटर",
      },
    ],

    processSteps: [
      "सामग्री को स्वच्छ पात्र में मिलाएं।",
      "घोल को अच्छी तरह मिश्रित करें।",
      "उपयोग से पहले छानें।",
      "पहले छोटे क्षेत्र पर परीक्षण करें।",
    ],

    usage:
      "फसल में समस्या के लक्षण दिखने पर स्थानीय कृषि सलाह के अनुसार उपयोग करें।",

    precautions:
      "प्राकृतिक घोल को रासायनिक fungicide का स्वतः विकल्प न मानें। रोग की सही पहचान जरूरी है।",

    featured: false,
    status: "active",

    seo: {
      metaTitle: "सोंठ दूध छाछ फफूंद प्रबंधन | जैविक खेती",
      metaDescription:
        "सोंठ, दूध या छाछ आधारित प्राकृतिक फफूंद प्रबंधन की जानकारी और सावधानियां।",
      keywords: [
        "फफूंद प्रबंधन",
        "सोंठ दूध",
        "छाछ",
        "जैविक खेती",
      ],
      focusKeyword: "प्राकृतिक फफूंद प्रबंधन",
      schemaType: "Article",
      allowIndex: true,
      allowFollow: true,
    },
  },
];

const seedRecipes = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB connected");

    const categories = await OrganicCategory.find({}).lean();

    const categoryMap = {};

    categories.forEach((category) => {
      categoryMap[category.slug] = category._id;
    });

    for (const recipe of recipes) {
      await OrganicRecipe.findOneAndUpdate(
        { id: recipe.id },
        {
          ...recipe,
          categoryId: categoryMap[recipe.category] || null,
          categorySlug: recipe.category,
          publishedAt: new Date(),
          updatedAtContent: new Date(),
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        }
      );
    }

    console.log(
      `${recipes.length} organic recipes seeded successfully`
    );

    process.exit(0);
  } catch (error) {
    console.error("Organic recipe seed error:", error);
    process.exit(1);
  }
};

seedRecipes();