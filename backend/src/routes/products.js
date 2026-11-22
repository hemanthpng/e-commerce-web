import { Router } from "express";
import Product from "../models/Product.js";

const router = Router();
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

router.get("/", async (req, res, next) => {
  try {
    const { category, search, sort } = req.query;
    const filter = {};
    if (category && category !== "All") filter.category = category;
    if (search) filter.name = { $regex: escapeRegex(String(search).slice(0, 80)), $options: "i" };
    const sortBy = sort === "price-asc" ? { price: 1 } : sort === "price-desc" ? { price: -1 } : { featured: -1, createdAt: -1 };
    const products = await Product.find(filter).sort(sortBy).lean();
    res.json({ products });
  } catch (error) {
    next(error);
  }
});

router.get("/:slug", async (req, res, next) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug }).lean();
    if (!product) return res.status(404).json({ message: "Product not found." });
    res.json({ product });
  } catch (error) {
    next(error);
  }
});

export default router;
