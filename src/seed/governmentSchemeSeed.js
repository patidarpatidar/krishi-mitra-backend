require("dotenv").config();

const mongoose = require("mongoose");

const GovernmentScheme = require("../models/GovernmentScheme");
const SchemeCategory = require("../models/SchemeCategory");

const schemes = [
  // =========================================================
  // 01 — PM KISAN
  // =========================================================

  {
    id: "pm-kisan",
    slug: "pm-kisan",

    name: "प्रधानमंत्री किसान सम्मान निधि",
    shortName: "PM-KISAN",

    level: "केंद्र सरकार",
    government: "भारत सरकार",
    department: "कृषि एवं किसान कल्याण विभाग",

    category: "किसान सहायता",
    categorySlug: "kisan-sahayata",

    icon: "sprout",

    description:
      "प्रधानमंत्री किसान सम्मान निधि (PM-KISAN) भारत सरकार की Central Sector Scheme है। पात्र भूमि-धारक किसान परिवारों को योजना के अंतर्गत ₹6,000 प्रति वर्ष तीन समान किस्तों में आय सहायता दी जाती है।",

    benefits: [
      "पात्र किसान परिवारों को ₹6,000 प्रति वर्ष की आय सहायता।",
      "राशि तीन समान किस्तों में दी जाती है।",
      "PM-KISAN portal पर किसान अपना status और beneficiary information देख सकते हैं।",
      "New Farmer Registration और self-registration जैसी सुविधाएं उपलब्ध हैं.",
    ],

    eligibility: [
      "योजना के नियमों के अनुसार पात्र भूमि-धारक किसान परिवार।",
      "किसान परिवार की पात्रता और exclusion conditions PM-KISAN guidelines के अनुसार निर्धारित होती हैं।",
      "सरकारी portal पर उपलब्ध नवीनतम eligibility rules को आवेदन से पहले verify करें।",
    ],

    documents: [
      "आधार कार्ड",
      "बैंक खाते की जानकारी",
      "मोबाइल नंबर",
      "भूमि संबंधी जानकारी/रिकॉर्ड",
      "अन्य दस्तावेज, जैसा official portal द्वारा मांगा जाए",
    ],

    howToApply: [
      "PM-KISAN official portal खोलें।",
      "Farmers Corner में New Farmer Registration विकल्प देखें।",
      "आवश्यक किसान और भूमि संबंधी जानकारी भरें।",
      "आवश्यक verification/eKYC प्रक्रिया पूरी करें।",
      "Application/beneficiary status official portal से check करें।",
    ],

    importantLinks: [
      {
        title: "Official Website",
        url: "https://pmkisan.gov.in/",
        type: "official",
      },
      {
        title: "Beneficiary Status / List",
        url: "https://pmkisan.gov.in/",
        type: "status",
      },
    ],

    sourceName: "PM-KISAN Official Portal",
    sourceUrl: "https://pmkisan.gov.in/",

    helpline: null,

    lastVerifiedAt: "08 अक्टूबर 2026",

    tags: [
      "PM-KISAN",
      "किसान सम्मान निधि",
      "किसान सहायता",
      "DBT",
    ],

    seo: {
      metaTitle:
        "PM-KISAN योजना 2026 | किसान सम्मान निधि | Krishi Mitra",

      metaDescription:
        "PM-KISAN योजना की पात्रता, ₹6,000 वार्षिक सहायता, दस्तावेज, आवेदन प्रक्रिया और beneficiary status की जानकारी।",

      keywords: [
        "PM Kisan",
        "PM-KISAN",
        "किसान सम्मान निधि",
        "PM Kisan Yojana",
        "किसान योजना",
      ],

      focusKeyword: "PM Kisan Yojana",

      canonicalUrl: "",

      ogTitle:
        "प्रधानमंत्री किसान सम्मान निधि | PM-KISAN",

      ogDescription:
        "PM-KISAN योजना की पात्रता, लाभ और आवेदन प्रक्रिया की जानकारी।",

      ogImage: "",

      twitterTitle:
        "PM-KISAN योजना | किसान सम्मान निधि",

      twitterDescription:
        "PM-KISAN योजना की पूरी जानकारी।",

      twitterImage: "",

      schemaType: "Article",

      allowIndex: true,
      allowFollow: true,
    },

    featured: true,
    status: "active",

    views: 0,
    likes: 0,

    publishedAt: new Date(),
    updatedAtContent: new Date(),
  },

  // =========================================================
  // 02 — PMFBY
  // =========================================================

  {
    id: "pmfby",
    slug: "pmfby",

    name: "प्रधानमंत्री फसल बीमा योजना",
    shortName: "PMFBY",

    level: "केंद्र सरकार",
    government: "भारत सरकार",
    department: "कृषि एवं किसान कल्याण मंत्रालय",

    category: "फसल बीमा",
    categorySlug: "fasal-bima",

    icon: "shield",

    description:
      "प्रधानमंत्री फसल बीमा योजना किसानों के लिए फसल बीमा से संबंधित सरकारी योजना है। Official PMFBY portal पर किसान crop insurance application, premium calculator और application status जैसी सुविधाओं का उपयोग कर सकते हैं।",

    benefits: [
      "फसल बीमा से संबंधित सुविधा।",
      "Online crop insurance application की सुविधा।",
      "Insurance Premium Calculator उपलब्ध है।",
      "Application status online check किया जा सकता है।",
      "Crop loss और grievance से संबंधित सहायता के लिए official portal पर सुविधा उपलब्ध है।",
    ],

    eligibility: [
      "किसान की पात्रता संबंधित फसल, क्षेत्र और लागू सरकारी अधिसूचना के अनुसार होती है।",
      "जिस season और crop के लिए योजना लागू हो, उसी के अनुसार आवेदन किया जाता है।",
      "अंतिम eligibility और enrollment period official PMFBY portal से verify करें।",
    ],

    documents: [
      "आधार/मान्य पहचान पत्र",
      "बैंक खाते की जानकारी",
      "मोबाइल नंबर",
      "भूमि/कृषि संबंधी जानकारी",
      "फसल संबंधी जानकारी",
      "Official application में मांगे गए अन्य दस्तावेज",
    ],

    howToApply: [
      "PMFBY official portal खोलें।",
      "Farmer Corner में जाएं।",
      "Crop Insurance के लिए application शुरू करें।",
      "State, District, Crop और अन्य जानकारी भरें।",
      "Premium और application details verify करें।",
      "Application status official portal से check करें।",
    ],

    importantLinks: [
      {
        title: "Official Website",
        url: "https://pmfby.gov.in/home",
        type: "official",
      },
      {
        title: "Apply for Crop Insurance",
        url: "https://pmfby.gov.in/farmerApplicationForm",
        type: "apply",
      },
      {
        title: "Premium Calculator",
        url: "https://pmfby.gov.in/premiumCalculator",
        type: "calculator",
      },
      {
        title: "Farmer Login",
        url: "https://pmfby.gov.in/farmerLogin",
        type: "login",
      },
    ],

    sourceName: "PMFBY Official Portal",
    sourceUrl: "https://pmfby.gov.in/home",

    helpline: "14447",

    lastVerifiedAt: "08 अक्टूबर 2026",

    tags: [
      "PMFBY",
      "फसल बीमा",
      "Crop Insurance",
      "14447",
    ],

    seo: {
      metaTitle:
        "PMFBY योजना 2026 | प्रधानमंत्री फसल बीमा योजना",

      metaDescription:
        "प्रधानमंत्री फसल बीमा योजना की पात्रता, लाभ, दस्तावेज, आवेदन प्रक्रिया, premium calculator और application status की जानकारी।",

      keywords: [
        "PMFBY",
        "प्रधानमंत्री फसल बीमा योजना",
        "फसल बीमा",
        "Crop Insurance",
        "PMFBY 2026",
      ],

      focusKeyword:
        "प्रधानमंत्री फसल बीमा योजना",

      canonicalUrl: "",

      ogTitle:
        "प्रधानमंत्री फसल बीमा योजना | PMFBY",

      ogDescription:
        "PMFBY फसल बीमा योजना की पूरी जानकारी।",

      ogImage: "",

      twitterTitle:
        "PMFBY | प्रधानमंत्री फसल बीमा योजना",

      twitterDescription:
        "PMFBY योजना की पात्रता और आवेदन की जानकारी।",

      twitterImage: "",

      schemaType: "Article",

      allowIndex: true,
      allowFollow: true,
    },

    featured: true,
    status: "active",

    views: 0,
    likes: 0,

    publishedAt: new Date(),
    updatedAtContent: new Date(),
  },

  // =========================================================
  // 03 — KCC
  // =========================================================

  {
    id: "kisan-credit-card",
    slug: "kisan-credit-card",

    name: "किसान क्रेडिट कार्ड",
    shortName: "KCC",

    level: "केंद्र सरकार",
    government: "भारत सरकार",
    department: "कृषि एवं किसान कल्याण मंत्रालय",

    category: "कृषि ऋण",
    categorySlug: "krishi-rin",

    icon: "credit",

    description:
      "किसान क्रेडिट कार्ड (KCC) योजना का उद्देश्य किसानों को खेती और संबंधित गतिविधियों के लिए पर्याप्त और समय पर बैंकिंग credit उपलब्ध कराना है।",

    benefits: [
      "खेती के short-term credit requirements को पूरा करने में सहायता।",
      "Post-harvest expenses के लिए credit सुविधा।",
      "Produce marketing loan की सुविधा।",
      "Agriculture और allied activities के लिए credit आवश्यकता को support करता है।",
      "Dairy, poultry, fisheries जैसी allied activities के लिए भी KCC framework के अंतर्गत credit उपलब्ध हो सकता है।",
    ],

    eligibility: [
      "Owner cultivator किसान।",
      "Joint borrowers के रूप में पात्र किसान।",
      "Tenant farmers और share croppers भी लागू नियमों के अनुसार पात्र हो सकते हैं।",
      "SHG/JLG of farmers भी scheme guidelines के अनुसार पात्र हो सकते हैं।",
    ],

    documents: [
      "KCC application form",
      "पासपोर्ट आकार के फोटो",
      "आधार/अन्य valid identity proof",
      "Address proof",
      "भूमि संबंधी प्रमाण",
      "Cropping pattern और acreage की जानकारी",
      "Bank द्वारा मांगे गए अन्य documents",
    ],

    howToApply: [
      "अपनी पसंद के participating bank की website या branch से KCC सुविधा की जानकारी लें।",
      "Kisan Credit Card application option चुनें।",
      "Application form में किसान और खेती संबंधी जानकारी भरें।",
      "आवश्यक documents submit करें।",
      "Bank द्वारा eligibility और documents verification के बाद आगे की प्रक्रिया पूरी होती है।",
    ],

    importantLinks: [
      {
        title: "MyScheme Official Details",
        url: "https://www.myscheme.gov.in/schemes/kcc",
        type: "official",
      },
    ],

    sourceName: "myScheme - Government of India",
    sourceUrl: "https://www.myscheme.gov.in/schemes/kcc",

    helpline: null,

    lastVerifiedAt: "08 अक्टूबर 2026",

    tags: [
      "KCC",
      "किसान क्रेडिट कार्ड",
      "कृषि ऋण",
      "Bank Loan",
    ],

    seo: {
      metaTitle:
        "KCC योजना 2026 | किसान क्रेडिट कार्ड | Krishi Mitra",

      metaDescription:
        "किसान क्रेडिट कार्ड KCC की पात्रता, लाभ, जरूरी दस्तावेज, आवेदन प्रक्रिया और कृषि ऋण की जानकारी।",

      keywords: [
        "KCC",
        "Kisan Credit Card",
        "किसान क्रेडिट कार्ड",
        "कृषि ऋण",
        "KCC Loan",
      ],

      focusKeyword:
        "किसान क्रेडिट कार्ड",

      canonicalUrl: "",

      ogTitle:
        "किसान क्रेडिट कार्ड | KCC",

      ogDescription:
        "KCC योजना की पात्रता, लाभ और आवेदन प्रक्रिया।",

      ogImage: "",

      twitterTitle:
        "KCC | किसान क्रेडिट कार्ड",

      twitterDescription:
        "किसान क्रेडिट कार्ड की पूरी जानकारी।",

      twitterImage: "",

      schemaType: "Article",

      allowIndex: true,
      allowFollow: true,
    },

    featured: true,
    status: "active",

    views: 0,
    likes: 0,

    publishedAt: new Date(),
    updatedAtContent: new Date(),
  },

  // =========================================================
  // 04 — CM KISAN KALYAN
  // =========================================================

  {
    id: "cm-kisan-kalyan",
    slug: "cm-kisan-kalyan",

    name: "मुख्यमंत्री किसान कल्याण योजना",
    shortName: "CM Kisan Kalyan Yojana",

    level: "मध्य प्रदेश सरकार",
    government: "मध्य प्रदेश शासन",
    department: "राजस्व विभाग",

    category: "मध्य प्रदेश योजना",
    categorySlug: "madhya-pradesh-yojana",

    icon: "landmark",

    description:
      "मुख्यमंत्री किसान कल्याण योजना मध्य प्रदेश शासन की किसान कल्याण योजना है। MP Government scheme dashboard के अनुसार पात्र किसानों को वर्ष में कुल ₹6,000 तीन समान किस्तों में दिए जाते हैं।",

    benefits: [
      "पात्र किसानों को वर्ष में कुल ₹6,000 की सहायता।",
      "राशि ₹2,000 की तीन समान किस्तों में दी जाती है।",
      "किस्तों का भुगतान राज्य स्तर से किया जाता है।",
      "योजना मध्य प्रदेश के पात्र किसानों के लिए राज्य-प्रवर्तित योजना है।",
    ],

    eligibility: [
      "PM-KISAN के पात्र हितग्राहियों के लिए योजना संबंधी पात्रता लागू होती है।",
      "मध्य प्रदेश शासन के संबंधित नियम और beneficiary verification लागू होंगे।",
      "अपनी वर्तमान पात्रता संबंधित पटवारी/तहसील कार्यालय और official MP portal से verify करें।",
    ],

    documents: [
      "आधार कार्ड",
      "भूमि संबंधी रिकॉर्ड",
      "बैंक खाते की जानकारी",
      "मोबाइल नंबर",
      "अन्य दस्तावेज, जैसा संबंधित विभाग द्वारा मांगा जाए",
    ],

    howToApply: [
      "योजना की पात्रता official MP Government information से verify करें।",
      "संबंधित पटवारी के माध्यम से आवेदन प्रक्रिया की जानकारी लें।",
      "जरूरत पड़ने पर संबंधित तहसील कार्यालय से संपर्क करें।",
      "SAARA MP portal पर उपलब्ध किसान सेवाओं और beneficiary status को check करें।",
    ],

    importantLinks: [
      {
        title: "MP Government Scheme Details",
        url: "https://cmhelpline.mp.gov.in/Schmedetail.aspx?Schemeid=606",
        type: "official",
      },
      {
        title: "SAARA MP Portal",
        url: "https://saara.mp.gov.in/",
        type: "portal",
      },
      {
        title: "MP Scheme Dashboard",
        url: "https://cmhelpline.mp.gov.in/SchemeDashboard.aspx",
        type: "official",
      },
    ],

    sourceName:
      "मध्य प्रदेश शासन - Scheme Dashboard / SAARA",

    sourceUrl: "https://saara.mp.gov.in/",

    helpline: null,

    lastVerifiedAt: "08 अक्टूबर 2026",

    tags: [
      "मध्य प्रदेश",
      "किसान कल्याण",
      "CM Kisan Kalyan",
      "MP Government",
    ],

    seo: {
      metaTitle:
        "मुख्यमंत्री किसान कल्याण योजना 2026 | MP किसान योजना",

      metaDescription:
        "मध्य प्रदेश मुख्यमंत्री किसान कल्याण योजना की पात्रता, लाभ, दस्तावेज, आवेदन प्रक्रिया और official links की जानकारी।",

      keywords: [
        "मुख्यमंत्री किसान कल्याण योजना",
        "CM Kisan Kalyan",
        "MP Kisan Yojana",
        "मध्य प्रदेश किसान योजना",
        "किसान कल्याण योजना",
      ],

      focusKeyword:
        "मुख्यमंत्री किसान कल्याण योजना",

      canonicalUrl: "",

      ogTitle:
        "मुख्यमंत्री किसान कल्याण योजना | MP",

      ogDescription:
        "मध्य प्रदेश किसान कल्याण योजना की पूरी जानकारी।",

      ogImage: "",

      twitterTitle:
        "CM Kisan Kalyan Yojana | MP",

      twitterDescription:
        "मध्य प्रदेश मुख्यमंत्री किसान कल्याण योजना की जानकारी।",

      twitterImage: "",

      schemaType: "Article",

      allowIndex: true,
      allowFollow: true,
    },

    featured: true,
    status: "active",

    views: 0,
    likes: 0,

    publishedAt: new Date(),
    updatedAtContent: new Date(),
  },
];

// =========================================================
// SEED FUNCTION
// =========================================================

const seedGovernmentSchemes = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI
    );

    console.log("MongoDB connected");

    // -------------------------------------------------------
    // 1. Make sure categories exist
    // -------------------------------------------------------

    const categoryMap = {};

    const categorySlugs = [
      ...new Set(
        schemes.map(
          (scheme) => scheme.categorySlug
        )
      ),
    ];

    const categories =
      await SchemeCategory.find({
        slug: {
          $in: categorySlugs,
        },
      });

    categories.forEach((category) => {
      categoryMap[category.slug] = category;
    });

    // -------------------------------------------------------
    // 2. Validate all categories
    // -------------------------------------------------------

    for (const scheme of schemes) {
      const category =
        categoryMap[scheme.categorySlug];

      if (!category) {
        throw new Error(
          `Category not found: ${scheme.categorySlug}`
        );
      }

      // Connect actual MongoDB category
      scheme.categoryId = category._id;

      // Keep original category field
      scheme.category = category.name;

      // Keep normalized category slug
      scheme.categorySlug = category.slug;
    }

    // -------------------------------------------------------
    // 3. Upsert schemes
    // -------------------------------------------------------

    for (const scheme of schemes) {
      await GovernmentScheme.findOneAndUpdate(
        {
          id: scheme.id,
        },
        scheme,
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
          runValidators: true,
        }
      );

      console.log(
        `Seeded: ${scheme.shortName}`
      );
    }

    // -------------------------------------------------------
    // 4. Count
    // -------------------------------------------------------

    const count =
      await GovernmentScheme.countDocuments();

    console.log(
      `\nGovernment schemes in database: ${count}`
    );

    console.log(
      `Successfully seeded ${schemes.length} government schemes`
    );

    await mongoose.disconnect();

    console.log("MongoDB disconnected");

    process.exit(0);
  } catch (error) {
    console.error(
      "\nGovernment scheme seed failed:"
    );

    console.error(error.message);

    await mongoose.disconnect();

    process.exit(1);
  }
};

seedGovernmentSchemes();