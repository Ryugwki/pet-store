import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
  {
    siteName: { type: String, default: "Pet Store" },
    // Legacy object-based sections kept for backward compatibility
    homeSections: {
      headSection: {
        contentHtml: {
          type: String,
          default:
            "<h2>Our kings and queens</h2><p>Our breeding program emphasizes thorough health testing for sire, dams &amp; kittens. This ensures healthy parents, reduces the risk of genetic issues, and promotes lifelong well-being in our kittens.</p>",
        },
        bgColor: { type: String, default: "#b91c1c" },
      },
      bottomSection: {
        contentHtml: {
          type: String,
          default:
            "<h2>What are you paying for:</h2><p>You are paying for a beautiful cat, for our reputation, and for our many years of work on improving and perfecting the breed in terms of health, appearance, and size.</p>",
        },
      },
    },
    // New: ordered list of homepage sections
    sections: [
      new mongoose.Schema(
        {
          title: { type: String, default: "" },
          contentHtml: { type: String, default: "" },
          bgColor: { type: String, default: "" },
          textColor: { type: String, default: "" },
          fontSize: { type: Number, default: 0 },
          order: { type: Number, default: 1 },
        },
        { _id: true, id: true }
      ),
    ],
    // Position of the Featured block among homepage sections (1..sections.length+1)
    featuredPosition: { type: Number, default: 1 },
    hero: {
      home: {
        title: { type: String, default: "Welcome to our Cattery" },
        subtitle: {
          type: String,
          default: "Healthy, socialized cats and kittens.",
        },
        images: [{ type: String }],
      },
      kings: {
        title: { type: String, default: "Available Males" },
        subtitle: {
          type: String,
          default: "Champion bloodlines and excellent temperaments.",
        },
        images: [{ type: String }],
      },
      queens: {
        title: { type: String, default: "Available Females" },
        subtitle: {
          type: String,
          default: "Elegant queens with wonderful personalities.",
        },
        images: [{ type: String }],
      },
      kittens: {
        title: { type: String, default: "Kittens for Sale" },
        subtitle: {
          type: String,
          default: "Playful, healthy kittens ready for loving homes.",
        },
        images: [{ type: String }],
      },
    },
    // Admin-selected featured pets (order preserved)
    featuredPetIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Pet" }],
    about: {
      title: { type: String, default: "About Us" },
      content: { type: String, default: "" },
      images: [{ type: String }],
    },
    contact: {
      email: { type: String, default: "" },
      phone: { type: String, default: "" },
      address: { type: String, default: "" },
      imessage: { type: String, default: "" },
      mapEmbed: { type: String, default: "" },
      content: { type: String, default: "" },
    },
    // Home hero marketing: eyebrow + the 3-stat band. Defaults mirror
    // DEFAULT_HOME_MARKETING in front-end/src/constants/siteDefaults.ts so the
    // site looks identical until the owner edits. The live cat-count stat uses
    // the "{count}" token, which the FE replaces with the real catalogue size.
    home: {
      eyebrow: {
        type: String,
        default: "WCF & CFA Registered · Maine Coon",
      },
      stats: {
        type: [
          new mongoose.Schema(
            {
              value: { type: String, default: "" },
              label: { type: String, default: "" },
            },
            { _id: false }
          ),
        ],
        default: [
          {
            value: "100%",
            label: "Health-tested lines\nHCM · SMA · PKD",
          },
          {
            value: "{count}",
            label: "Cats in our\ncurrent catalogue",
          },
          {
            value: "3–5 yrs",
            label: "The slow maturing of a\ntrue gentle giant",
          },
        ],
      },
    },
    // Trust strip: eyebrow + title + 3 columns. Defaults mirror DEFAULT_TRUST
    // in front-end/src/constants/siteDefaults.ts.
    trust: {
      eyebrow: {
        type: String,
        default: "Why families wait for one of our kittens",
      },
      title: {
        type: String,
        default: "Bred with the patience of a much older tradition.",
      },
      columns: {
        type: [
          new mongoose.Schema(
            {
              num: { type: String, default: "" },
              title: { type: String, default: "" },
              body: { type: String, default: "" },
            },
            { _id: false }
          ),
        ],
        default: [
          {
            num: "No. 1",
            title: "Health, proven on paper",
            body: "Our lines are DNA-tested clear for HCM, SMA and PKD, with cardiac ultrasounds and full DNA panels. Results are shared openly with every family who asks.",
          },
          {
            num: "No. 2",
            title: "Registered pedigree",
            body: "We register every cat and kitten with the World Cat Federation (WCF) and the Cat Fanciers’ Association (CFA). Each kitten carries papers tracing to European champion catteries, viewable in full on PawPeds.",
          },
          {
            num: "No. 3",
            title: "Raised underfoot",
            body: "Kittens grow up in our living room among children and ordinary noise — kept to twelve to sixteen weeks so they are emotionally mature before they go to their new homes.",
          },
        ],
      },
    },
    // Policy page content: intro + policy bullets + reservation steps. Defaults
    // mirror DEFAULT_POLICY in front-end/src/constants/siteDefaults.ts (intro is
    // empty by default, matching the current page which shows no intro).
    policy: {
      intro: { type: String, default: "" },
      bullets: {
        type: [String],
        default: [
          "Registered kittens with vet check-up and sales agreement.",
          "Parents/ancestors health tested for HCM/PKD (ultrasound), HD (X-ray), and DNA.",
          "Kittens tested for FeLV/FIV and parasites.",
        ],
      },
      reservation: {
        type: [
          new mongoose.Schema(
            {
              title: { type: String, default: "" },
              body: { type: String, default: "" },
            },
            { _id: false }
          ),
        ],
        default: [
          {
            title: "Deposit",
            body: "A $500 non-refundable deposit is required to secure your spot on the waiting list.",
          },
          {
            title: "Second Deposit",
            body: "An additional $500 deposit is due 4 weeks after the kittens are born.",
          },
          {
            title: "Deposit Guarantee",
            body: "Your deposit guarantees a quality kitten from our 2024 litters, with your preferred gender, coat type, and color (subject to availability).",
          },
          {
            title: "Price",
            body: "{price} for all colors.",
          },
        ],
      },
    },
    // Pricing: policy-page base price + currency conversion. Defaults mirror
    // DEFAULT_PRICING in front-end/src/constants/siteDefaults.ts.
    pricing: {
      basePrice: { type: Number, default: 3000 },
      currency: { type: String, default: "USD" },
      deposit: { type: Number, default: 500 },
      vndRate: { type: Number, default: 25000 },
      litterYear: { type: String, default: "2024" },
    },
  },
  { timestamps: true }
);

export default mongoose.model("Settings", settingsSchema);
