import express from "express";
import Pet from "../models/Pet.js";
import Settings from "../models/Settings.js";
import auth from "../middlewares/auth.js";

const router = express.Router();

// GET /api/admin/stats
router.get("/stats", async (_req, res) => {
  try {
    const [
      total,
      males,
      females,
      kittens,
      kings,
      queens,
      uncategorized,
    ] = await Promise.all([
      Pet.countDocuments({}),
      Pet.countDocuments({ gender: "male" }),
      Pet.countDocuments({ gender: "female" }),
      Pet.countDocuments({ category: "Kittens" }), // category-based (was age<=1.2 heuristic)
      Pet.countDocuments({ category: "Kings" }),
      Pet.countDocuments({ category: "Queens" }),
      // Pets with no category set (null/missing or not one of the enum values).
      Pet.countDocuments({
        category: { $nin: ["Kings", "Queens", "Kittens"] },
      }),
    ]);

    // Number of admin-selected featured pets (0 when settings/list absent).
    const settings = await Settings.findOne().select("featuredPetIds");
    const featured = settings?.featuredPetIds?.length || 0;

    // Existing keys (total/males/females/kittens) preserved for backward
    // compatibility; new keys appended additively.
    res.json({
      total,
      males,
      females,
      kittens,
      kings,
      queens,
      uncategorized,
      featured,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch admin stats" });
  }
});

export default router;

// Settings endpoints
router.get("/settings", async (_req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    res.json(settings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch settings" });
  }
});

// Recursively merge `source` into `target` for plain objects so that a
// partial save (e.g. only hero.home) does NOT wipe sibling sub-keys.
// Arrays and non-plain values replace wholesale (normal behavior).
function isPlainObject(v) {
  return (
    v != null &&
    typeof v === "object" &&
    !Array.isArray(v) &&
    Object.getPrototypeOf(v) === Object.prototype
  );
}

function deepMerge(target, source) {
  const out = isPlainObject(target) ? { ...target } : {};
  for (const [key, srcVal] of Object.entries(source)) {
    const tgtVal = out[key];
    if (isPlainObject(srcVal) && isPlainObject(tgtVal)) {
      out[key] = deepMerge(tgtVal, srcVal);
    } else {
      // Arrays (sections, featuredPetIds, images) and scalars replace wholesale.
      out[key] = srcVal;
    }
  }
  return out;
}

// Validate a Google Maps embed value. Returns "" unless the value is an
// <iframe> whose src points at https://www.google.com/maps.
function sanitizeMapEmbed(value) {
  if (typeof value !== "string") return "";
  const v = value.trim();
  if (!v) return "";
  if (!/<iframe[\s>]/i.test(v)) return "";
  const srcMatch = v.match(/\ssrc\s*=\s*["']([^"']*)["']/i);
  const src = srcMatch ? srcMatch[1].trim() : "";
  if (!src.startsWith("https://www.google.com/maps")) return "";
  return v;
}

// Protect update with auth middleware
router.put("/settings", auth, async (req, res) => {
  try {
    const data = req.body || {};
    let settings = await Settings.findOne();
    if (!settings) settings = new Settings({});

    // Deep-merge nested objects (hero.{home,kings,queens,kittens}, about,
    // contact) so partial saves don't clobber sibling sub-keys; arrays
    // replace wholesale.
    const merged = deepMerge(settings.toObject(), data);

    // Validate/strip contact.mapEmbed when present in the incoming payload.
    if (
      merged.contact &&
      Object.prototype.hasOwnProperty.call(data.contact || {}, "mapEmbed")
    ) {
      merged.contact.mapEmbed = sanitizeMapEmbed(merged.contact.mapEmbed);
    }

    settings.set(merged);
    await settings.save();
    res.json(settings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update settings" });
  }
});
