import express from "express";
import Pet from "../models/Pet.js";
import Settings from "../models/Settings.js";

const router = express.Router();

// Normalize incoming category casing/slug to the canonical enum.
// Accepts "kings"/"Kings"/"KINGS"/slug variants; returns the canonical
// value (e.g. "Kings") or null when it doesn't map to a known category.
function normalizeCategory(input) {
  if (input == null) return null;
  const key = String(input).trim().toLowerCase();
  if (!key) return null;
  const map = {
    kings: "Kings",
    king: "Kings",
    queens: "Queens",
    queen: "Queens",
    kittens: "Kittens",
    kitten: "Kittens",
  };
  return map[key] || null;
}

// Normalize gender to the stored lowercase enum (male/female), or null.
function normalizeGender(input) {
  if (input == null) return null;
  const key = String(input).trim().toLowerCase();
  if (key === "male" || key === "female") return key;
  return null;
}

// GET /api/pets
router.get("/", async (req, res) => {
  try {
    const {
      q,
      color,
      gender,
      category,
      sortBy = "createdAt",
      sortOrder = "desc",
      page = 1,
      limit = 20,
    } = req.query;

    const filter = {};
    if (q) filter.name = { $regex: q, $options: "i" };
    if (color)
      filter["characteristics.color"] = {
        $regex: String(color),
        $options: "i",
      };
    if (gender) {
      // Accept male/female case-insensitively; fall back to raw value
      // so an unknown gender yields an (empty) deterministic result.
      filter.gender = normalizeGender(gender) ?? gender;
    }
    if (category) {
      // Accept "kings"/"Kings"/"KINGS"/slug; fall back to raw value
      // so unknown categories still query deterministically (empty result).
      filter.category = normalizeCategory(category) ?? category;
    }

    const skip = (Number(page) - 1) * Number(limit);
    const sort = {
      [String(sortBy)]: String(sortOrder).toLowerCase() === "asc" ? 1 : -1,
    };

    const [items, total] = await Promise.all([
      Pet.find(filter).sort(sort).skip(skip).limit(Number(limit)),
      Pet.countDocuments(filter),
    ]);

    res.json({ items, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch pets" });
  }
});

// GET /api/pets/featured
router.get("/featured", async (_req, res) => {
  try {
    const s = await Settings.findOne().select("featuredPetIds");
    if (s?.featuredPetIds && s.featuredPetIds.length) {
      // Preserve order as stored in settings
      const ids = s.featuredPetIds.map(String);
      const pets = await Pet.find({ _id: { $in: ids } });
      const byId = new Map(pets.map((p) => [String(p._id), p]));
      const ordered = ids.map((id) => byId.get(id)).filter(Boolean);
      return res.json(ordered);
    }
    // When no featured pets are configured, return an empty list
    // (previously this fell back to latest 8 pets, which caused UX inconsistency)
    res.json([]);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch featured" });
  }
});

// GET /api/pets/category/:gender
// Interpret :category as Pet.category, not gender
router.get("/category/:category", async (req, res) => {
  try {
    const { category } = req.params;
    // Normalize casing/slug to the canonical enum before querying;
    // fall back to the raw param so unknown values stay deterministic.
    const normalized = normalizeCategory(category) ?? category;
    const items = await Pet.find({ category: normalized }).sort({
      createdAt: -1,
    });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch category" });
  }
});

// GET /api/pets/:id
router.get("/:id", async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);
    if (!pet) return res.status(404).json({ message: "Pet not found" });

    // Plain object so we can attach populated parents WITHOUT losing the
    // raw fatherId/motherId fields the front-end still reads.
    const out = pet.toObject();

    // Additively resolve parent refs. Keep fatherId/motherId intact; omit a
    // parent object entirely when its id is missing or unresolvable.
    const parentSelect = "_id name category petImages";
    const [father, mother] = await Promise.all([
      pet.fatherId
        ? Pet.findById(pet.fatherId).select(parentSelect).lean()
        : null,
      pet.motherId
        ? Pet.findById(pet.motherId).select(parentSelect).lean()
        : null,
    ]);
    if (father) out.father = father;
    if (mother) out.mother = mother;

    res.json(out);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch pet" });
  }
});

// POST /api/pets
router.post("/", async (req, res) => {
  try {
    const pet = await Pet.create(req.body);
    res.status(201).json(pet);
  } catch (err) {
    res.status(400).json({ message: err.message || "Failed to create pet" });
  }
});

// PUT /api/pets/:id
router.put("/:id", async (req, res) => {
  try {
    const pet = await Pet.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!pet) return res.status(404).json({ message: "Pet not found" });
    res.json(pet);
  } catch (err) {
    res.status(400).json({ message: err.message || "Failed to update pet" });
  }
});

// DELETE /api/pets/:id
router.delete("/:id", async (req, res) => {
  try {
    const pet = await Pet.findByIdAndDelete(req.params.id);
    if (!pet) return res.status(404).json({ message: "Pet not found" });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ message: err.message || "Failed to delete pet" });
  }
});

export default router;
